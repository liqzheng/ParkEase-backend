import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Space, Tag, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import * as spaceApi from '../../api/spots';
import type { ParkingSpace } from '../../types';

const { Option } = Select;

export const AdminSpaces: React.FC = () => {
  const [spaces, setSpaces] = useState<ParkingSpace[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSpace, setEditingSpace] = useState<ParkingSpace | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadSpaces();
  }, []);

  const loadSpaces = async () => {
    try {
      setLoading(true);
      const data = await spaceApi.getAllSpaces();
      setSpaces(data);
    } catch (error) {
      message.error('Failed to load parking spaces');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingSpace(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (space: ParkingSpace) => {
    setEditingSpace(space);
    form.setFieldsValue(space);
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await spaceApi.deleteSpace(id);
      message.success('Deleted successfully');
      loadSpaces();
    } catch (error) {
      message.error('Failed to delete');
    }
  };

  const handleStatusChange = async (id: string, status: ParkingSpace['status']) => {
    try {
      await spaceApi.updateSpaceStatus(id, status);
      message.success('Status updated successfully');
      loadSpaces();
    } catch (error) {
      message.error('Failed to update status');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingSpace) {
        await spaceApi.updateSpace(editingSpace._id, values);
        message.success('Updated successfully');
      } else {
        await spaceApi.createSpace(values);
        message.success('Added successfully');
      }
      setModalVisible(false);
      loadSpaces();
    } catch (error: any) {
      message.error(error?.message || 'Operation failed');
    }
  };

  const columns = [
    {
      title: 'Number',
      dataIndex: 'spaceNumber',
      key: 'spaceNumber',
    },
    {
      title: 'Floor',
      dataIndex: 'floor',
      key: 'floor',
    },
    {
      title: 'Zone',
      dataIndex: 'zone',
      key: 'zone',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        const typeMap: Record<string, { text: string; color: string }> = {
          REGULAR: { text: 'Regular', color: 'blue' },
          VIP: { text: 'VIP', color: 'gold' },
          DISABLED: { text: 'Disabled', color: 'green' },
        };
        const info = typeMap[type] || { text: type, color: 'default' };
        return <Tag color={info.color}>{info.text}</Tag>;
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: ParkingSpace['status'], record: ParkingSpace) => {
        return (
          <Select
            value={status}
            onChange={(value: ParkingSpace['status']) => handleStatusChange(record._id, value)}
            style={{ width: 100 }}
            size="small"
          >
            <Option value="AVAILABLE">Available</Option>
            <Option value="OCCUPIED">Occupied</Option>
            <Option value="RESERVED">Reserved</Option>
          </Select>
        );
      },
    },
    {
      title: 'Size',
      dataIndex: 'size',
      key: 'size',
    },
    {
      title: 'Actions',
      key: 'action',
      render: (_: any, record: ParkingSpace) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this parking space?"
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
        <h1>Parking Space Management</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Add Parking Space
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={spaces}
        loading={loading}
        rowKey="_id"
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingSpace ? 'Edit Parking Space' : 'Add Parking Space'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Space Number"
            name="spaceNumber"
            rules={[{ required: true, message: 'Please enter space number' }]}
          >
            <Input placeholder="e.g., 1F-01" />
          </Form.Item>

          <Form.Item
            label="Floor"
            name="floor"
            rules={[{ required: true, message: 'Please enter floor' }]}
          >
            <Input type="number" placeholder="e.g., 1" />
          </Form.Item>

          <Form.Item
            label="Zone"
            name="zone"
            rules={[{ required: true, message: 'Please select zone' }]}
          >
            <Select>
              <Option value="A">Zone A</Option>
              <Option value="B">Zone B</Option>
              <Option value="C">Zone C</Option>
              <Option value="D">Zone D</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Type"
            name="type"
            rules={[{ required: true, message: 'Please select type' }]}
            initialValue="REGULAR"
          >
            <Select>
              <Option value="REGULAR">Regular</Option>
              <Option value="VIP">VIP</Option>
              <Option value="DISABLED">Disabled</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Size"
            name="size"
            rules={[{ required: true, message: 'Please select size' }]}
            initialValue="MEDIUM"
          >
            <Select>
              <Option value="SMALL">Small</Option>
              <Option value="MEDIUM">Medium</Option>
              <Option value="LARGE">Large</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Status"
            name="status"
            initialValue="AVAILABLE"
          >
            <Select>
              <Option value="AVAILABLE">Available</Option>
              <Option value="OCCUPIED">Occupied</Option>
              <Option value="RESERVED">Reserved</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
