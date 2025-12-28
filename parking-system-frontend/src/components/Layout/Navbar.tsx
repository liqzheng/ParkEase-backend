import React from 'react';
import { Layout, Menu, Button, Dropdown, Avatar } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserOutlined, LogoutOutlined, HomeOutlined, CarOutlined } from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import type { MenuProps } from 'antd';

const { Header } = Layout;

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const menuItems: MenuProps['items'] = [
    {
      key: '/',
      label: 'Home',
      icon: <HomeOutlined />,
    },
    {
      key: '/spaces',
      label: 'Parking Spaces',
      icon: <CarOutlined />,
    },
  ];

  // Add menu items based on user role
  if (user) {
    if (user.role === 'OWNER') {
      menuItems.push({
        key: '/my-vehicles',
        label: 'My Vehicles',
      });
      menuItems.push({
        key: '/my-reservations',
        label: 'My Reservations',
      });
    }
    
    if (user.role === 'ADMIN' || user.role === 'GUARD') {
      menuItems.push({
        key: '/records',
        label: 'Parking Records',
      });
    }
    
    if (user.role === 'ADMIN') {
      menuItems.push({
        key: '/admin/spaces',
        label: 'Manage Spaces',
      });
    }
  }

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      label: 'Profile',
      icon: <UserOutlined />,
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      label: 'Logout',
      icon: <LogoutOutlined />,
      danger: true,
    },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    if (key === 'logout') {
      handleLogout();
    } else if (key === 'profile') {
      navigate('/profile');
    } else {
      navigate(key);
    }
  };

  return (
    <Header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff' }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div
          style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#1890ff',
            marginRight: '40px',
            cursor: 'pointer',
          }}
          onClick={() => navigate('/')}
        >
          Parking Management System
        </div>
        <Menu
          theme="light"
          mode="horizontal"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ flex: 1, minWidth: 0 }}
        />
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {user ? (
          <>
            <span>Welcome, {user.firstName} {user.lastName}</span>
            <Dropdown
              menu={{
                items: userMenuItems,
                onClick: handleMenuClick,
              }}
              placement="bottomRight"
            >
              <Avatar
                style={{ backgroundColor: '#1890ff', cursor: 'pointer' }}
                icon={<UserOutlined />}
              />
            </Dropdown>
          </>
        ) : (
          <>
            <Button type="text" onClick={() => navigate('/login')}>
              Login
            </Button>
            <Button type="primary" onClick={() => navigate('/register')}>
              Sign Up
            </Button>
          </>
        )}
      </div>
    </Header>
  );
};
