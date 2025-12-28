import React from 'react';
import { Card, Tag, Space, Button } from 'antd';
import { CarOutlined, EnvironmentOutlined } from '@ant-design/icons';
import type { ParkingSpace } from '../types';

interface SpotCardProps {
  spot: ParkingSpace;
  onReserve?: (spot: ParkingSpace) => void;
  onView?: (spot: ParkingSpace) => void;
}

export const SpotCard: React.FC<SpotCardProps> = ({ spot, onReserve, onView }) => {
  const getStatusColor = (status: ParkingSpace['status']) => {
    switch (status) {
      case 'AVAILABLE':
        return 'success';
      case 'OCCUPIED':
        return 'error';
      case 'RESERVED':
        return 'processing';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: ParkingSpace['status']) => {
    switch (status) {
      case 'AVAILABLE':
        return 'Available';
      case 'OCCUPIED':
        return 'Occupied';
      case 'RESERVED':
        return 'Reserved';
      default:
        return status;
    }
  };

  const getTypeColor = (type: ParkingSpace['type']) => {
    switch (type) {
      case 'VIP':
        return 'gold';
      case 'DISABLED':
        return 'green';
      default:
        return 'blue';
    }
  };

  const getTypeText = (type: ParkingSpace['type']) => {
    switch (type) {
      case 'VIP':
        return 'VIP';
      case 'DISABLED':
        return 'Disabled';
      default:
        return 'Regular';
    }
  };

  return (
    <Card
      hoverable
      style={{ marginBottom: '16px' }}
      actions={[
        <Button
          key="view"
          type="link"
          onClick={() => onView?.(spot)}
        >
          View Details
        </Button>,
        spot.status === 'AVAILABLE' && onReserve ? (
          <Button
            key="reserve"
            type="primary"
            onClick={() => onReserve(spot)}
          >
            Reserve
          </Button>
        ) : null,
      ].filter(Boolean)}
    >
      <Card.Meta
        avatar={<CarOutlined style={{ fontSize: '24px' }} />}
        title={
          <Space>
            <span>{spot.spaceNumber}</span>
            <Tag color={getStatusColor(spot.status)}>
              {getStatusText(spot.status)}
            </Tag>
            <Tag color={getTypeColor(spot.type)}>
              {getTypeText(spot.type)}
            </Tag>
          </Space>
        }
        description={
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <div>
              <EnvironmentOutlined /> Floor {spot.floor} - Zone {spot.zone}
            </div>
            <div>Size: {spot.size}</div>
          </Space>
        }
      />
    </Card>
  );
};
