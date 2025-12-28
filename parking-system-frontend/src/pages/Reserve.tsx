import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Form, DatePicker, Button, message, Descriptions, Tag, Space } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import * as spaceApi from '../api/spots';
import * as reservationApi from '../api/reservations';
import dayjs from 'dayjs';
import type { ParkingSpace } from '../types';

const { RangePicker } = DatePicker;

export const Reserve: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [space, setSpace] = useState<ParkingSpace | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    if (!user) {
      message.warning('Please login first');
      navigate('/login');
      return;
    }
    if (id) {
      loadSpace();
    }
  }, [id, user]);

  const loadSpace = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await spaceApi.getSpaceById(id);
      setSpace(data);
      if (data.status !== 'AVAILABLE') {
        message.warning('This parking space is not available');
        navigate('/spaces');
      }
    } catch (error) {
      message.error('Failed to load parking space');
      navigate('/spaces');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: any) => {
    if (!space) return;
    try {
      setSubmitting(true);
      const [startTime, endTime] = values.timeRange;
      await reservationApi.createReservation(
        space._id,
        startTime.toISOString(),
        endTime.toISOString()
      );
      message.success('Reservation successful!');
      navigate('/my-reservations');
    } catch (error: any) {
      message.error(error?.message || 'Reservation failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '24px' }}>Loading...</div>;
  }

  if (!space) {
    return <div style={{ padding: '24px' }}>Parking space not found</div>;
  }

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate('/spaces')}
        style={{ marginBottom: '16px' }}
      >
        Back
      </Button>

      <Card title="Reserve Parking Space">
        <Descriptions column={1} bordered style={{ marginBottom: '24px' }}>
          <Descriptions.Item label="Number">{space.spaceNumber}</Descriptions.Item>
          <Descriptions.Item label="Location">
            Floor {space.floor} - Zone {space.zone}
          </Descriptions.Item>
          <Descriptions.Item label="Type">
            <Tag color={space.type === 'VIP' ? 'gold' : space.type === 'DISABLED' ? 'green' : 'blue'}>
              {space.type === 'VIP' ? 'VIP' : space.type === 'DISABLED' ? 'Disabled' : 'Regular'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Size">{space.size}</Descriptions.Item>
        </Descriptions>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            label="Select Reservation Time"
            name="timeRange"
            rules={[
              { required: true, message: 'Please select reservation time' },
              {
                validator: (_: any, value: any) => {
                  if (!value || value.length !== 2) {
                    return Promise.reject(new Error('Please select a complete time range'));
                  }
                  const [start, end] = value;
                  if (start >= end) {
                    return Promise.reject(new Error('End time must be later than start time'));
                  }
                  if (start < dayjs()) {
                    return Promise.reject(new Error('Start time cannot be earlier than current time'));
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <RangePicker
              showTime
              format="YYYY-MM-DD HH:mm"
              style={{ width: '100%' }}
              disabledDate={(current) => current && current < dayjs().startOf('day')}
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={submitting}>
                Confirm Reservation
              </Button>
              <Button onClick={() => navigate('/spaces')}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};
