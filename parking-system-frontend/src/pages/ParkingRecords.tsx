import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Select, Input, message, Space, Tag, Statistic, Row, Col, Card } from 'antd';
import { CheckOutlined, CheckCircleOutlined, DollarOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import * as recordApi from '../api/records';
import * as vehicleApi from '../api/vehicles';
import * as spaceApi from '../api/spots';
import dayjs from 'dayjs';
import type { ParkingRecord, Vehicle, ParkingSpace } from '../types';

const { Option } = Select;

export const ParkingRecords: React.FC = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState<ParkingRecord[]>([]);
  const [activeRecords, setActiveRecords] = useState<ParkingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkInModalVisible, setCheckInModalVisible] = useState(false);
  const [checkOutModalVisible, setCheckOutModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<ParkingRecord | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [spaces, setSpaces] = useState<ParkingSpace[]>([]);
  const [checkInForm] = Form.useForm();
  const [checkOutForm] = Form.useForm();

  useEffect(() => {
    if (user && (user.role === 'ADMIN' || user.role === 'GUARD')) {
      loadData();
    } else {
      message.warning('You do not have permission to access this page');
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [allRecords, active, allVehicles, allSpaces] = await Promise.all([
        recordApi.getAllRecords(),
        recordApi.getActiveRecords(),
        vehicleApi.getAllVehicles(),
        spaceApi.getAvailableSpaces(),
      ]);
      setRecords(allRecords);
      setActiveRecords(active);
      setVehicles(allVehicles);
      setSpaces(allSpaces);
    } catch (error) {
      message.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (values: any) => {
    try {
      await recordApi.checkIn(values.vehicleId, values.spaceId);
      message.success('Check-in successful');
      setCheckInModalVisible(false);
      checkInForm.resetFields();
      loadData();
    } catch (error: any) {
      message.error(error?.message || 'Check-in failed');
    }
  };

  const handleCheckOut = async (values: any) => {
    try {
      const record = await recordApi.checkOut(values.recordId);
      message.success(`Check-out successful. Fee: $${record.fee.toFixed(2)}`);
      setCheckOutModalVisible(false);
      checkOutForm.resetFields();
      loadData();
    } catch (error: any) {
      message.error(error?.message || 'Check-out failed');
    }
  };

  const handlePay = async (recordId: string) => {
    try {
      await recordApi.payFee(recordId);
      message.success('Payment successful');
      loadData();
    } catch (error: any) {
      message.error('Payment failed');
    }
  };

  const openCheckOutModal = (record: ParkingRecord) => {
    setSelectedRecord(record);
    checkOutForm.setFieldsValue({ recordId: record._id });
    setCheckOutModalVisible(true);
  };

  const columns = [
    {
      title: 'Plate Number',
      key: 'plateNumber',
      render: (_: any, record: ParkingRecord) => {
        const vehicle = record.vehicle as Vehicle;
        return vehicle?.plateNumber || 'Unknown';
      },
    },
    {
      title: 'Parking Space',
      key: 'space',
      render: (_: any, record: ParkingRecord) => {
        const space = record.space as ParkingSpace;
        return space?.spaceNumber || 'Unknown';
      },
    },
    {
      title: 'Check-in Time',
      dataIndex: 'checkInTime',
      key: 'checkInTime',
      render: (time: string) => dayjs(time).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: 'Check-out Time',
      dataIndex: 'checkOutTime',
      key: 'checkOutTime',
      render: (time: string) => time ? dayjs(time).format('YYYY-MM-DD HH:mm') : '-',
    },
    {
      title: 'Fee',
      dataIndex: 'fee',
      key: 'fee',
      render: (fee: number) => fee ? `$${fee.toFixed(2)}` : '-',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'ACTIVE' ? 'green' : 'default'}>
          {status === 'ACTIVE' ? 'Active' : 'Completed'}
        </Tag>
      ),
    },
    {
      title: 'Payment Status',
      dataIndex: 'paymentStatus',
      key: 'paymentStatus',
      render: (status: string, record: ParkingRecord) => {
        if (record.status === 'ACTIVE') return '-';
        return (
          <Tag color={status === 'PAID' ? 'green' : 'orange'}>
            {status === 'PAID' ? 'Paid' : 'Pending'}
          </Tag>
        );
      },
    },
    {
      title: 'Actions',
      key: 'action',
      render: (_: any, record: ParkingRecord) => (
        <Space>
          {record.status === 'ACTIVE' && (
            <Button
              type="primary"
              size="small"
              onClick={() => openCheckOutModal(record)}
            >
              Check Out
            </Button>
          )}
          {record.status === 'COMPLETED' && record.paymentStatus === 'PENDING' && (
            <Button
              type="link"
              size="small"
              onClick={() => handlePay(record._id)}
            >
              Pay
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const totalRevenue = records
    .filter(r => r.paymentStatus === 'PAID')
    .reduce((sum, r) => sum + (r.fee || 0), 0);

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between' }}>
        <h1>Parking Records Management</h1>
        <Button
          type="primary"
          icon={<CheckOutlined />}
          onClick={() => setCheckInModalVisible(true)}
        >
          Vehicle Check-in
        </Button>
      </div>

      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Total Records"
              value={records.length}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Active"
              value={activeRecords.length}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Total Revenue"
              value={totalRevenue}
              prefix={<DollarOutlined />}
              precision={2}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      <Table
        columns={columns}
        dataSource={records}
        loading={loading}
        rowKey="_id"
        pagination={{ pageSize: 10 }}
      />

      {/* Check-in Modal */}
      <Modal
        title="Vehicle Check-in"
        open={checkInModalVisible}
        onCancel={() => {
          setCheckInModalVisible(false);
          checkInForm.resetFields();
        }}
        onOk={() => checkInForm.submit()}
      >
        <Form form={checkInForm} layout="vertical" onFinish={handleCheckIn}>
          <Form.Item
            label="Select Vehicle"
            name="vehicleId"
            rules={[{ required: true, message: 'Please select a vehicle' }]}
          >
            <Select placeholder="Select vehicle">
              {vehicles.map(v => (
                <Option key={v._id} value={v._id}>
                  {v.plateNumber} - {v.make} {v.model}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="Select Parking Space"
            name="spaceId"
            rules={[{ required: true, message: 'Please select a parking space' }]}
          >
            <Select placeholder="Select parking space">
              {spaces.map(s => (
                <Option key={s._id} value={s._id}>
                  {s.spaceNumber} - Floor {s.floor} Zone {s.zone}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Check-out Modal */}
      <Modal
        title="Vehicle Check-out"
        open={checkOutModalVisible}
        onCancel={() => {
          setCheckOutModalVisible(false);
          checkOutForm.resetFields();
        }}
        onOk={() => checkOutForm.submit()}
      >
        {selectedRecord && (
          <div style={{ marginBottom: '16px' }}>
            <p>Confirm vehicle check-out? The system will automatically calculate the fee.</p>
          </div>
        )}
        <Form form={checkOutForm} layout="vertical" onFinish={handleCheckOut}>
          <Form.Item name="recordId" hidden>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
