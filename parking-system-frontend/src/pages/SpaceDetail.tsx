import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Tag, Button, message, Modal, Form, DatePicker, Space } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import * as spaceApi from '../api/spots';
import * as reservationApi from '../api/reservations';
import dayjs from 'dayjs';
import type { ParkingSpace } from '../types';

const { RangePicker } = DatePicker;

export const SpaceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [space, setSpace] = useState<ParkingSpace | null>(null);
  const [loading, setLoading] = useState(true);
  const [reserveModalVisible, setReserveModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    if (id) {
      loadSpace();
    }
  }, [id]);

  const loadSpace = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await spaceApi.getSpaceById(id);
      setSpace(data);
    } catch (error) {
      message.error('Failed to load parking space details');
      navigate('/spaces');
    } finally {
      setLoading(false);
    }
  };

  const handleReserve = async (values: any) => {
    if (!space) return;
    try {
      const [startTime, endTime] = values.timeRange;
      await reservationApi.createReservation(
        space._id,
        startTime.toISOString(),
        endTime.toISOString()
      );
      message.success('Reservation successful');
      setReserveModalVisible(false);
      form.resetFields();
    } catch (error: any) {
      message.error(error?.message || 'Reservation failed');
    }
  };

  const getStatusColor = (status: string) => {
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

  const getStatusText = (status: string) => {
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

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'VIP':
        return 'gold';
      case 'DISABLED':
        return 'green';
      default:
        return 'blue';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'VIP':
        return 'VIP Space';
      case 'DISABLED':
        return 'Disabled Space';
      default:
        return 'Regular Space';
    }
  };

  if (loading) {
    return <div style={{ padding: '24px' }}>Loading...</div>;
  }

  if (!space) {
    return <div style={{ padding: '24px' }}>Parking space not found</div>;
  }

  return (
    <div style={{ padding: '24px' }}>
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate('/spaces')}
        style={{ marginBottom: '16px' }}
      >
        Back
      </Button>

      <Card
        title={
          <Space>
            <span>{space.spaceNumber}</span>
            <Tag color={getStatusColor(space.status)}>
              {getStatusText(space.status)}
            </Tag>
            <Tag color={getTypeColor(space.type)}>
              {getTypeText(space.type)}
            </Tag>
          </Space>
        }
        extra={
          space.status === 'AVAILABLE' && user && (
            <Button
              type="primary"
              onClick={() => setReserveModalVisible(true)}
            >
              Reserve Now
            </Button>
          )
        }
      >
        <Descriptions column={2} bordered>
          <Descriptions.Item label="Number">{space.spaceNumber}</Descriptions.Item>
          <Descriptions.Item label="Floor">Floor {space.floor}</Descriptions.Item>
          <Descriptions.Item label="Zone">Zone {space.zone}</Descriptions.Item>
          <Descriptions.Item label="Type">{getTypeText(space.type)}</Descriptions.Item>
          <Descriptions.Item label="Size">{space.size}</Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag color={getStatusColor(space.status)}>
              {getStatusText(space.status)}
            </Tag>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Modal
        title="Reserve Parking Space"
        open={reserveModalVisible}
        onCancel={() => {
          setReserveModalVisible(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
      >
        <div style={{ marginBottom: '16px' }}>
          <p><strong>Parking Space:</strong> {space.spaceNumber}</p>
          <p><strong>Location:</strong> Floor {space.floor} - Zone {space.zone}</p>
        </div>
        <Form form={form} layout="vertical" onFinish={handleReserve}>
          <Form.Item
            label="Select Time"
            name="timeRange"
            rules={[{ required: true, message: 'Please select reservation time' }]}
          >
            <RangePicker
              showTime
              format="YYYY-MM-DD HH:mm"
              style={{ width: '100%' }}
              disabledDate={(current) => current && current < dayjs().startOf('day')}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
