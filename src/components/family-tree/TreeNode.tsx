import React from 'react';
import { TreeNode as TreeNodeType } from './useTreeLayout';
import { FamilyMember } from '@/components/hooks/useFamilyTree';

interface TreeNodeProps {
  node: TreeNodeType;
  scale: number;
  isSelected: boolean;
  onSelect: (memberId: string) => void;
  onAddMember?: (relationType: 'parent' | 'spouse' | 'child', relatedTo: FamilyMember) => void;
  hasSpouse: boolean;
  hasParents: boolean;
}

export const TreeNode: React.FC<TreeNodeProps> = ({
  node,
  scale,
  isSelected,
  onSelect,
  onAddMember,
  hasSpouse,
  hasParents,
}) => {
  const [isHovering, setIsHovering] = React.useState(false);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const calculateAge = (birthDateStr?: string, deathDateStr?: string) => {
    if (!birthDateStr) return '';
    const birthDate = new Date(birthDateStr);
    const endDate = deathDateStr ? new Date(deathDateStr) : new Date();

    if (isNaN(birthDate.getTime())) return '';
    if (endDate < birthDate) return '';

    let years = endDate.getFullYear() - birthDate.getFullYear();
    const m = endDate.getMonth() - birthDate.getMonth();

    if (m < 0 || (m === 0 && endDate.getDate() < birthDate.getDate())) {
      years--;
    }

    if (years >= 1) return `(${years} yrs)`;

    let months = (endDate.getFullYear() - birthDate.getFullYear()) * 12 + (endDate.getMonth() - birthDate.getMonth());
    if (endDate.getDate() < birthDate.getDate()) {
      months--;
    }

    if (months >= 1) return `(${months} months)`;

    const diffTime = endDate.getTime() - birthDate.getTime();
    const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    return `(${days} days)`;
  };

  const isDeceased = node.member.death_date;
  const initials = `${node.member.first_name[0]}${node.member.last_name?.[0] || ''}`;
  const genderColor =
    node.member.gender === 'male'
      ? '#3b82f6'
      : node.member.gender === 'female'
        ? '#ec4899'
        : '#9ca3af';

  const cardWidth = node.width;
  const cardHeight = node.height;
  const x = node.x;
  const y = node.y;

  // If there's a spouse, position them side by side
  const spouseOffsetX = node.spouse ? cardWidth + 12 : 0;
  const totalWidth = node.spouse ? cardWidth * 2 + 12 : cardWidth;

  return (
    <g key={node.id}>
      {/* Main Member Card */}
      <g
        onClick={() => onSelect(node.id)}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        style={{ cursor: 'pointer' }}
      >
        {/* Card background */}
        <rect
          x={x}
          y={y}
          width={cardWidth}
          height={cardHeight}
          rx={8}
          ry={8}
          fill={isSelected ? '#f0f9ff' : '#ffffff'}
          stroke={
            isSelected
              ? '#3b82f6'
              : isHovering
                ? '#e5e7eb'
                : '#d1d5db'
          }
          strokeWidth={isSelected ? 2 : 1}
          style={{
            transition: 'all 0.2s ease',
            filter: isDeceased ? 'grayscale(0.5)' : 'none',
          }}
        />

        {/* Deceased Ribbon (SVG) */}
        {isDeceased && (
          <path
            d={`M ${x + cardWidth - 30} ${y} L ${x + cardWidth} ${y} L ${x + cardWidth} ${y + 30} Z`}
            fill="#374151"
            opacity={0.8}
            style={{ pointerEvents: 'none' }}
          />
        )}

        {/* Gender indicator dot */}
        <circle
          cx={x + cardWidth - 12}
          cy={y + 10}
          r={5}
          fill={genderColor}
          opacity={0.8}
        />

        {/* Root indicator (gold border) */}
        {node.member.is_root && (
          <circle
            cx={x + 12}
            cy={y + 10}
            r={6}
            fill="none"
            stroke="#f59e0b"
            strokeWidth={2}
          />
        )}

        {/* Avatar or initials */}
        <rect
          x={x + cardWidth / 2 - 15}
          y={y + 8}
          width={30}
          height={30}
          rx={4}
          fill={genderColor}
          opacity={0.1}
        />
        <text
          x={x + cardWidth / 2}
          y={y + 27}
          textAnchor="middle"
          fontSize="12"
          fontWeight="600"
          fill={genderColor}
        >
          {initials}
        </text>

        {/* Name */}
        <text
          x={x + cardWidth / 2}
          y={y + 48}
          textAnchor="middle"
          fontSize="13"
          fontWeight="700"
          fill="#111827"
          style={{
            textDecoration: isDeceased ? 'line-through' : 'none',
          }}
        >
          {node.member.first_name}
        </text>
        <text
          x={x + cardWidth / 2}
          y={y + 62}
          textAnchor="middle"
          fontSize="12"
          fontWeight="500"
          fill="#6b7280"
          style={{
            textDecoration: isDeceased ? 'line-through' : 'none',
          }}
        >
          {node.member.last_name}
        </text>

        {/* Birth date - Only show if alive (not deceased) */}
        {!isDeceased && node.member.birth_date && (
          <text
            x={x + cardWidth / 2}
            y={y + cardHeight - 6}
            textAnchor="middle"
            fontSize="10"
            fill="#9ca3af"
          >
            b. {formatDate(node.member.birth_date)} {calculateAge(node.member.birth_date)}
          </text>
        )}

        {/* Death indicator */}
        {isDeceased && (
          <text
            x={x + cardWidth / 2}
            y={y + cardHeight - 6}
            textAnchor="middle"
            fontSize="9"
            fill="#ef4444"
          >
            † {formatDate(node.member.death_date)} {calculateAge(node.member.birth_date, node.member.death_date)}
          </text>
        )}
      </g>

      {/* Spouse Card (if exists) */}
      {node.spouse && (
        <g
          onClick={() => onSelect(node.spouse!.id)}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          style={{ cursor: 'pointer' }}
        >
          {/* Spouse card background */}
          <rect
            x={x + spouseOffsetX}
            y={y}
            width={cardWidth}
            height={cardHeight}
            rx={8}
            ry={8}
            fill={isSelected && false ? '#f0f9ff' : '#ffffff'}
            stroke={isHovering ? '#e5e7eb' : '#d1d5db'}
            strokeWidth={1}
            style={{
              transition: 'all 0.2s ease',
              opacity: 0.9,
            }}
          />

          {/* Deceased Ribbon for Spouse */}
          {node.spouse.death_date && (
            <path
              d={`M ${x + spouseOffsetX + cardWidth - 30} ${y} L ${x + spouseOffsetX + cardWidth} ${y} L ${x + spouseOffsetX + cardWidth} ${y + 30} Z`}
              fill="#374151"
              opacity={0.8}
              style={{ pointerEvents: 'none' }}
            />
          )}

          {/* Gender indicator */}
          <circle
            cx={x + spouseOffsetX + cardWidth - 12}
            cy={y + 10}
            r={5}
            fill={
              node.spouse.gender === 'male'
                ? '#3b82f6'
                : node.spouse.gender === 'female'
                  ? '#ec4899'
                  : '#9ca3af'
            }
            opacity={0.8}
          />

          {/* Avatar */}
          <rect
            x={x + spouseOffsetX + cardWidth / 2 - 15}
            y={y + 8}
            width={30}
            height={30}
            rx={4}
            fill={
              node.spouse.gender === 'male'
                ? '#3b82f6'
                : node.spouse.gender === 'female'
                  ? '#ec4899'
                  : '#9ca3af'
            }
            opacity={0.1}
          />
          <text
            x={x + spouseOffsetX + cardWidth / 2}
            y={y + 27}
            textAnchor="middle"
            fontSize="12"
            fontWeight="600"
            fill={
              node.spouse.gender === 'male'
                ? '#3b82f6'
                : '#ec4899'
            }
          >
            {node.spouse.first_name[0]}{node.spouse.last_name?.[0] || ''}
          </text>

          {/* Spouse name */}
          <text
            x={x + spouseOffsetX + cardWidth / 2}
            y={y + 48}
            textAnchor="middle"
            fontSize="13"
            fontWeight="700"
            fill="#111827"
          >
            {node.spouse.first_name}
          </text>
          <text
            x={x + spouseOffsetX + cardWidth / 2}
            y={y + 62}
            textAnchor="middle"
            fontSize="12"
            fontWeight="500"
            fill="#6b7280"
          >
            {node.spouse.last_name}
          </text>

          {/* Birth date */}
          {/* Birth/Death date for Spouse */}
          {node.spouse.death_date ? (
            <text
              x={x + spouseOffsetX + cardWidth / 2}
              y={y + cardHeight - 6}
              textAnchor="middle"
              fontSize="9"
              fill="#ef4444"
            >
              † {formatDate(node.spouse.death_date)} {calculateAge(node.spouse.birth_date, node.spouse.death_date)}
            </text>
          ) : node.spouse.birth_date ? (
            <text
              x={x + spouseOffsetX + cardWidth / 2}
              y={y + cardHeight - 6}
              textAnchor="middle"
              fontSize="10"
              fill="#9ca3af"
            >
              b. {formatDate(node.spouse.birth_date)} {calculateAge(node.spouse.birth_date)}
            </text>
          ) : null}
        </g>
      )}

      {/* Action Buttons - Always Visible */}
      {onAddMember && (
        <g>
          {/* Add Child Button */}
          <rect
            x={x + totalWidth / 2 - 30}
            y={y + cardHeight + 8}
            width={60}
            height={28}
            rx={4}
            fill="#3b82f6"
            opacity={0.85}
            style={{ cursor: 'pointer' }}
            onClick={() => onAddMember('child', node.member)}
          />
          <text
            x={x + totalWidth / 2}
            y={y + cardHeight + 25}
            textAnchor="middle"
            fontSize="11"
            fontWeight="600"
            fill="#ffffff"
            style={{ pointerEvents: 'none' }}
          >
            + Child
          </text>

          {/* Add Spouse Button (disabled if has spouse) */}
          {!hasSpouse && (
            <>
              <rect
                x={x - 70}
                y={y - 35}
                width={60}
                height={28}
                rx={4}
                fill="#10b981"
                opacity={0.85}
                style={{ cursor: 'pointer' }}
                onClick={() => onAddMember('spouse', node.member)}
              />
              <text
                x={x - 40}
                y={y - 12}
                textAnchor="middle"
                fontSize="11"
                fontWeight="600"
                fill="#ffffff"
                style={{ pointerEvents: 'none' }}
              >
                + Spouse
              </text>
            </>
          )}

          {/* Add Parent Button (disabled if has parents) */}
          {!hasParents && (
            <>
              <rect
                x={x + totalWidth + 10}
                y={y - 35}
                width={60}
                height={28}
                rx={4}
                fill="#f59e0b"
                opacity={0.85}
                style={{ cursor: 'pointer' }}
                onClick={() => onAddMember('parent', node.member)}
              />
              <text
                x={x + totalWidth + 40}
                y={y - 12}
                textAnchor="middle"
                fontSize="11"
                fontWeight="600"
                fill="#ffffff"
                style={{ pointerEvents: 'none' }}
              >
                + Parent
              </text>
            </>
          )}
        </g>
      )}
    </g>
  );
};
