import { differenceInMonths, differenceInYears, parseISO, isValid } from 'date-fns';
import Member, { IMember } from '@/models/Member';
import Relationship, { IRelationship } from '@/models/Relationship';
import mongoose from 'mongoose';

// Validation Result Type
export interface ValidationResult {
    valid: boolean;
    message?: string;
}

// 1. Sibling Validation
export async function validateSiblingGap(
    childId: string,
    birthDate: Date,
    treeId: string,
    parentId: string // one parent is enough to find siblings
): Promise<ValidationResult> {
    // Find all children of this parent
    const relationships = await Relationship.find({
        tree_id: treeId,
        person1_id: parentId,
        relationship_type: 'parent_child'
    });

    const siblingIds = relationships
        .map(r => r.person2_id.toString())
        .filter(id => id !== childId.toString());

    if (siblingIds.length === 0) return { valid: true };

    const siblings = await Member.find({
        _id: { $in: siblingIds },
        tree_id: treeId
    });

    for (const sibling of siblings) {
        if (!sibling.birth_date) continue;

        const sibDate = new Date(sibling.birth_date);
        const myDate = new Date(birthDate);

        // Calculate absolute difference in months
        const monthsDiff = Math.abs(differenceInMonths(myDate, sibDate));
        const daysDiff = Math.abs(myDate.getTime() - sibDate.getTime()) / (1000 * 60 * 60 * 24);

        // Exception for twins/multiple births (e.g., born within 2 days)
        if (daysDiff <= 2) continue;

        if (monthsDiff < 9) {
            return {
                valid: false,
                message: `Sibling birth dates are too close (${monthsDiff} months). Usually at least 9 months apart.`
            };
        }
    }

    return { valid: true };
}

// 2. Marriage Age Validation
export async function validateMarriageAge(
    personId: string,
    personDOB: Date,
    spouseId: string,
    spouseDOB: Date | undefined, // might not exist
    marriageDate?: Date
): Promise<ValidationResult> {
    const minAge = 16;

    // Check Person's age at marriage
    if (marriageDate) {
        const ageAtMarriage = differenceInYears(new Date(marriageDate), new Date(personDOB));
        if (ageAtMarriage < minAge) {
            return { valid: false, message: `Person is too young to be married (Age: ${ageAtMarriage}). Minimum age is ${minAge}.` };
        }
    } else {
        // If no marriage date, check current age? Or just age gap? 
        // "Calculate the age of the person so that when they get married..."
        // If we don't have a marriage date, we can assume "now" or just strictly check birth date.
        // If they are being added as a spouse -> they are married.
        // Let's check their current age if no marriage date provided, assuming marriage happened 'sometime'.
        // Actually, better: if no marriage date, we can't strictly validate age-at-marriage.
        // BUT, we can check if they are currently older than 16? 
        // If they were born 1 year ago, they can't be a spouse.
        const currentAge = differenceInYears(new Date(), new Date(personDOB));
        if (currentAge < minAge) {
            return { valid: false, message: `Person appears too young to be a spouse (Age: ${currentAge}). Minimum age is ${minAge}.` };
        }
    }

    // Check Spouse's age if known
    if (spouseDOB) {
        if (marriageDate) {
            const spouseAgeAtMarriage = differenceInYears(new Date(marriageDate), new Date(spouseDOB));
            if (spouseAgeAtMarriage < minAge) {
                return { valid: false, message: `Spouse is too young to be married (Age: ${spouseAgeAtMarriage}). Minimum age is ${minAge}.` };
            }
        } else {
            const spouseCurrentAge = differenceInYears(new Date(), new Date(spouseDOB));
            if (spouseCurrentAge < minAge) {
                return { valid: false, message: `Spouse appears too young (Age: ${spouseCurrentAge}). Minimum age is ${minAge}.` };
            }
        }
    }

    return { valid: true };
}

// 3. Parent-Child Age Validation
export async function validateParentAge(
    parentId: string,
    parentDOB: Date,
    childDOB: Date
): Promise<ValidationResult> {
    const minGap = 16;
    const yearsDiff = differenceInYears(new Date(childDOB), new Date(parentDOB));

    if (yearsDiff < minGap) {
        return {
            valid: false,
            message: `Parent is too young to have a child (Age gap: ${yearsDiff} years). Minimum gap is ${minGap} years.`
        };
    }
    // Also check if parent born AFTER child (negative gap)
    if (yearsDiff < 0) {
        return { valid: false, message: `Parent cannot be born after child.` };
    }

    return { valid: true };
}

// 4. Validate New Relationship
export async function validateNewRelationship(
    treeId: string,
    person1Id: string,
    person2Id: string,
    relationshipType: string,
    nature: 'biological' | 'adopted' = 'biological'
): Promise<ValidationResult> {
    const person1 = await Member.findById(person1Id);
    const person2 = await Member.findById(person2Id);

    if (!person1 || !person2) {
        return { valid: false, message: 'One or both members not found.' };
    }

    if (relationshipType === 'spouse') {
        // Check Marriage Age for both
        if (person1.birth_date) {
            const res = await validateMarriageAge(person1Id, person1.birth_date, person2Id, person2.birth_date);
            if (!res.valid) return res;
        }
    } else if (relationshipType === 'parent_child') {
        // Check 1: Biological Child Requirement (Must have 2 parents)
        if (nature === 'biological') {
            const spouseRel = await Relationship.findOne({
                tree_id: treeId,
                relationship_type: 'spouse',
                $or: [{ person1_id: person1Id }, { person2_id: person1Id }]
            });

            if (!spouseRel) {
                return {
                    valid: false,
                    message: "Biological children must have two parents (a spouse/partner is required). Mark as 'Adopted' if there is only one parent."
                };
            }
        }

        // person1 is parent, person2 is child
        if (person1.birth_date && person2.birth_date) {
            const res = await validateParentAge(person1Id, person1.birth_date, person2.birth_date);
            if (!res.valid) return res;
        }

        // Check Sibling Gap for the child (person2) relative to parent's (person1) other children
        if (person2.birth_date) {
            const res = await validateSiblingGap(person2Id, person2.birth_date, treeId, person1Id);
            if (!res.valid) return res;
        }


    }

    return { valid: true };
}


// 5. Validate Member Update (DOB Change)
export async function validateMemberUpdate(
    memberId: string,
    treeId: string,
    newBirthDate: Date
): Promise<ValidationResult> {
    const dateObj = new Date(newBirthDate);

    // 1. Check as Child: Validate against Parents
    const parentRels = await Relationship.find({
        tree_id: treeId,
        person2_id: memberId,
        relationship_type: 'parent_child'
    });

    for (const rel of parentRels) {
        const parent = await Member.findById(rel.person1_id);
        if (parent && parent.birth_date) {
            const res = await validateParentAge(parent._id.toString(), parent.birth_date, dateObj);
            if (!res.valid) return res;
        }

        const res = await validateSiblingGap(memberId, dateObj, treeId, rel.person1_id.toString());
        if (!res.valid) return res;
    }

    // 2. Check as Parent: Validate against Children
    const childrenRels = await Relationship.find({
        tree_id: treeId,
        person1_id: memberId,
        relationship_type: 'parent_child'
    });

    for (const rel of childrenRels) {
        const child = await Member.findById(rel.person2_id);
        if (child && child.birth_date) {
            const res = await validateParentAge(memberId, dateObj, child.birth_date);
            if (!res.valid) return res;
        }
    }

    // 3. Check as Spouse: Validate against Spouses
    const spouseRels = await Relationship.find({
        tree_id: treeId,
        $or: [
            { person1_id: memberId, relationship_type: 'spouse' },
            { person2_id: memberId, relationship_type: 'spouse' }
        ]
    });

    for (const rel of spouseRels) {
        const spouseId = rel.person1_id.toString() === memberId ? rel.person2_id : rel.person1_id;
        const spouse = await Member.findById(spouseId);
        if (spouse) {
            const res = await validateMarriageAge(memberId, dateObj, spouseId.toString(), spouse.birth_date, rel.marriage_date);
            if (!res.valid) return res;
        }
    }

    return { valid: true };
}
