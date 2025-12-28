import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Popconfirm, Space, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import * as vehicleApi from '../api/vehicles';
import type { Vehicle } from '../types';

const { Option } = Select;

export const MyVehicles: React.FC = () => {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    if (user) {
      loadVehicles();
    }
  }, [user]);

  const loadVehicles = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await vehicleApi.getVehiclesByOwner(user._id);
      setVehicles(data);
    } catch (error) {
      message.error('Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingVehicle(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    form.setFieldsValue(vehicle);
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await vehicleApi.deleteVehicle(id);
      message.success('Deleted successfully');
      loadVehicles();
    } catch (error) {
      message.error('Failed to delete');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingVehicle) {
        await vehicleApi.updateVehicle(editingVehicle._id, values);
        message.success('Updated successfully');
      } else {
        await vehicleApi.createVehicle(values);
        message.success('Added successfully');
      }
      setModalVisible(false);
      loadVehicles();
    } catch (error: any) {
      message.error(error?.message || 'Operation failed');
    }
  };

  const columns = [
    {
      title: 'Plate Number',
      dataIndex: 'plateNumber',
      key: 'plateNumber',
    },
    {
      title: 'Make',
      dataIndex: 'make',
      key: 'make',
    },
    {
      title: 'Model',
      dataIndex: 'model',
      key: 'model',
    },
    {
      title: 'Color',
      dataIndex: 'color',
      key: 'color',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        const typeMap: Record<string, { text: string; color: string }> = {
          CAR: { text: 'Car', color: 'blue' },
          MOTORCYCLE: { text: 'Motorcycle', color: 'orange' },
          TRUCK: { text: 'Truck', color: 'red' },
        };
        const info = typeMap[type] || { text: type, color: 'default' };
        return <Tag color={info.color}>{info.text}</Tag>;
      },
    },
    {
      title: 'Actions',
      key: 'action',
      render: (_: any, record: Vehicle) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this vehicle?"
            onConfirm={() => handleDelete(record._id)}
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between' }}>
        <h1>My Vehicles</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Add Vehicle
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={vehicles}
        loading={loading}
        rowKey="_id"
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingVehicle ? 'Edit Vehicle' : 'Add Vehicle'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            label="Plate Number"
            name="plateNumber"
            rules={[{ required: true, message: 'Please enter plate number' }]}
          >
            <Input placeholder="e.g., ABC123" />
          </Form.Item>

          <Form.Item
            label="Make"
            name="make"
            rules={[{ required: true, message: 'Please enter make' }]}
          >
            <Input placeholder="e.g., Toyota" />
          </Form.Item>

          <Form.Item
            label="Model"
            name="model"
            rules={[{ required: true, message: 'Please enter model' }]}
          >
            <Input placeholder="e.g., Camry" />
          </Form.Item>

          <Form.Item
            label="Color"
            name="color"
            rules={[{ required: true, message: 'Please enter color' }]}
          >
            <Input placeholder="e.g., White" />
          </Form.Item>

          <Form.Item
            label="Type"
            name="type"
            rules={[{ required: true, message: 'Please select type' }]}
            initialValue="CAR"
          >
            <Select>
              <Option value="CAR">Car</Option>
              <Option value="MOTORCYCLE">Motorcycle</Option>
              <Option value="TRUCK">Truck</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
