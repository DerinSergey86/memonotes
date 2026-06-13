/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { type Group, type LocationTag } from '@/types';
import GroupList from './GroupList';
import AddressList from './AddressList';

interface GroupAddressTabsProps {
  showAddresses: boolean;
  onToggle: (show: boolean) => void;
  groups: Group[];
  locationTags: LocationTag[];
  onGroupClick: (group: Group) => void;
  onEditGroup: (group: Group) => void;
  onAddGroup: () => void;
  onEditAddress: (tag: LocationTag) => void;
  onDeleteAddress: (id: string) => void;
  onAddAddress: () => void;
  activeTags: string[];
  geoEnabled: boolean;
  onToggleGeo: () => void;
  onAddressClick: (tagId: string) => void;
  activeLocationTagId: string | null;
}

export default function GroupAddressTabs({
  showAddresses,
  onToggle,
  groups,
  locationTags,
  onGroupClick,
  onEditGroup,
  onAddGroup,
  onEditAddress,
  onDeleteAddress,
  onAddAddress,
  activeTags,
  geoEnabled,
  onToggleGeo,
  onAddressClick,         
  activeLocationTagId,    
}: GroupAddressTabsProps) {
  return (
    <div>
      {/* Строка с переключателем, кнопкой "+" и геозонами */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '10px',
        gap: '12px',
        flexWrap: 'wrap',
      }}>
        {/* Сегментированный переключатель */}
        <div style={{
          display: 'inline-flex',
          borderRadius: '20px',
          overflow: 'hidden',
          border: '1px solid #859c5e',
        }}>
          <button
            onClick={() => onToggle(false)}
            style={{
              padding: '4px 12px',
              border: 'none',
              background: !showAddresses ? '#859c5e' : 'transparent',
              color: !showAddresses ? 'white' : '#859c5e',
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'all 0.2s',
            }}
          >
            🏷️ Группы
          </button>
          <button
            onClick={() => onToggle(true)}
            style={{
              padding: '4px 12px',
              border: 'none',
              background: showAddresses ? '#859c5e' : 'transparent',
              color: showAddresses ? 'white' : '#859c5e',
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'all 0.2s',
            }}
          >
            🗺️ Адреса
          </button>
        </div>

        {/* Кнопка "+" */}
        <button onClick={showAddresses ? onAddAddress : onAddGroup} style={{
           background: '#859c5e',
  border: 'none',
  fontSize: '18px',
  cursor: 'pointer',
  lineHeight: 1,
  color: 'white',
  width: '28px',
  height: '28px',
  borderRadius: '50%',
  boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 0,
        }}>
          ＋
        </button>

        {/* Кнопка геозон */}
        <button onClick={onToggleGeo} style={{
          padding: '4px 12px',
          borderRadius: '20px',
          fontSize: '14px',
          border: '1px solid #859c5e',
          cursor: 'pointer',
          background: geoEnabled ? '#f0f0f0' : '#859c5e',
          color: geoEnabled ? '#333' : 'white',
          whiteSpace: 'nowrap',
        }}>
          {geoEnabled ? '🛑 Остановить геозоны' : '📍 Включить геозоны'}
        </button>
      </div>

      {/* Контент: группы или адреса */}
      {showAddresses ? (
        <AddressList
          tags={locationTags}
          onEdit={onEditAddress}
          onAddressClick={onAddressClick}
  activeLocationTagId={activeLocationTagId}
        />
      ) : (
        <GroupList
          groups={groups}
          onGroupClick={onGroupClick}
          onEditGroup={onEditGroup}
          onAddGroup={onAddGroup}
          activeTags={activeTags}
        />
      )}
    </div>
  );
}