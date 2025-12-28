import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Button, Space, Tag } from 'antd';
import { CarOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getAvailableSpaces, getAllSpaces } from '../api/spots';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    occupied: 0,
    reserved: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const [allSpaces, availableSpaces] = await Promise.all([
        getAllSpaces(),
        getAvailableSpaces(),
      ]);

      const occupied = allSpaces.filter(s => s.status === 'OCCUPIED').length;
      const reserved = allSpaces.filter(s => s.status === 'RESERVED').length;

      setStats({
        total: allSpaces.length,
        available: availableSpaces.length,
        occupied,
        reserved,
      });
    } catch (error) {
      console.error('Failed to load statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>Parking Management System</h1>
        <p style={{ fontSize: '16px', color: '#666' }}>Welcome to the Smart Parking Management System</p>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Spaces"
              value={stats.total}
              prefix={<CarOutlined />}
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Available"
              value={stats.available}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#3f8600' }}
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Occupied"
              value={stats.occupied}
              valueStyle={{ color: '#cf1322' }}
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Reserved"
              value={stats.reserved}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
              loading={loading}
            />
          </Card>
        </Col>
      </Row>

      <Card title="Quick Actions">
        <Space size="large" wrap>
          <Button type="primary" size="large" onClick={() => navigate('/spaces')}>
            View All Spaces
          </Button>
          <Button size="large" onClick={() => navigate('/spaces?available=true')}>
            View Available Spaces
          </Button>
          <Button size="large" onClick={() => navigate('/my-vehicles')}>
            My Vehicles
          </Button>
          <Button size="large" onClick={() => navigate('/my-reservations')}>
            My Reservations
          </Button>
        </Space>
      </Card>

      <Card title="Space Type Information" style={{ marginTop: '24px' }}>
        <Space size="large" wrap>
          <Tag color="blue">REGULAR - Regular Space</Tag>
          <Tag color="gold">VIP - VIP Space</Tag>
          <Tag color="green">DISABLED - Disabled Space</Tag>
        </Space>
        <div style={{ marginTop: '16px' }}>
          <Space size="large" wrap>
            <Tag color="success">AVAILABLE - Available</Tag>
            <Tag color="error">OCCUPIED - Occupied</Tag>
            <Tag color="processing">RESERVED - Reserved</Tag>
          </Space>
        </div>
      </Card>
    </div>
  );
};
