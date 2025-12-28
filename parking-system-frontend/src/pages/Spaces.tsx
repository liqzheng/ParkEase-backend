import React, { useState, useEffect } from 'react';
import { Row, Col, Select, Button, Space, Input, Empty, Spin, message } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getAllSpaces, getAvailableSpaces, getSpacesByFloor, getSpacesByZone } from '../api/spots';
import { SpotCard } from '../components/SpotCard';
import { useAuth } from '../context/AuthContext';
import type { ParkingSpace } from '../types';

const { Option } = Select;

export const Spaces: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [spaces, setSpaces] = useState<ParkingSpace[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    floor: 'all',
    zone: 'all',
    type: 'all',
    search: '',
  });

  useEffect(() => {
    loadSpaces();
  }, [filters]);

  const loadSpaces = async () => {
    try {
      setLoading(true);
      let data: ParkingSpace[];

      if (filters.status === 'available') {
        data = await getAvailableSpaces();
      } else if (filters.floor !== 'all') {
        data = await getSpacesByFloor(parseInt(filters.floor));
      } else if (filters.zone !== 'all') {
        data = await getSpacesByZone(filters.zone);
      } else {
        data = await getAllSpaces();
      }

      // Apply type filter
      if (filters.type !== 'all') {
        data = data.filter(s => s.type === filters.type);
      }

      // Apply search filter
      if (filters.search) {
        data = data.filter(s =>
          s.spaceNumber.toLowerCase().includes(filters.search.toLowerCase())
        );
      }

      setSpaces(data);
    } catch (error) {
      message.error('Failed to load parking spaces');
    } finally {
      setLoading(false);
    }
  };

  const handleReserve = (spot: ParkingSpace) => {
    if (!user) {
      message.warning('Please login first');
      navigate('/login');
      return;
    }
    if (spot.status !== 'AVAILABLE') {
      message.warning('This parking space is not available');
      return;
    }
    navigate(`/reserve/${spot._id}`);
  };

  const handleView = (spot: ParkingSpace) => {
    navigate(`/spaces/${spot._id}`);
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Parking Spaces</h1>
        {user?.role === 'ADMIN' && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/admin/spaces/new')}
          >
            Add Space
          </Button>
        )}
      </div>

      <Space direction="vertical" size="large" style={{ width: '100%', marginBottom: '24px' }}>
        <Row gutter={16}>
          <Col xs={24} sm={12} md={6}>
            <Select
              style={{ width: '100%' }}
              placeholder="Status"
              value={filters.status}
              onChange={(value) => setFilters({ ...filters, status: value })}
            >
              <Option value="all">All Status</Option>
              <Option value="available">Available</Option>
              <Option value="occupied">Occupied</Option>
              <Option value="reserved">Reserved</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              style={{ width: '100%' }}
              placeholder="Floor"
              value={filters.floor}
              onChange={(value) => setFilters({ ...filters, floor: value })}
            >
              <Option value="all">All Floors</Option>
              <Option value="1">Floor 1</Option>
              <Option value="2">Floor 2</Option>
              <Option value="3">Floor 3</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              style={{ width: '100%' }}
              placeholder="Zone"
              value={filters.zone}
              onChange={(value) => setFilters({ ...filters, zone: value })}
            >
              <Option value="all">All Zones</Option>
              <Option value="A">Zone A</Option>
              <Option value="B">Zone B</Option>
              <Option value="C">Zone C</Option>
              <Option value="D">Zone D</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              style={{ width: '100%' }}
              placeholder="Type"
              value={filters.type}
              onChange={(value) => setFilters({ ...filters, type: value })}
            >
              <Option value="all">All Types</Option>
              <Option value="REGULAR">Regular</Option>
              <Option value="VIP">VIP</Option>
              <Option value="DISABLED">Disabled</Option>
            </Select>
          </Col>
        </Row>
        <Input
          placeholder="Search by space number"
          prefix={<SearchOutlined />}
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          allowClear
        />
      </Space>

      <Spin spinning={loading}>
        {spaces.length === 0 ? (
          <Empty description="No parking spaces found" />
        ) : (
          <Row gutter={[16, 16]}>
            {spaces.map((spot) => (
              <Col xs={24} sm={12} md={8} lg={6} key={spot._id}>
                <SpotCard
                  spot={spot}
                  onReserve={handleReserve}
                  onView={handleView}
                />
              </Col>
            ))}
          </Row>
        )}
      </Spin>
    </div>
  );
};
