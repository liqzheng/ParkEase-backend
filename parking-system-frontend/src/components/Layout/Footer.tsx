import React from 'react';
import { Layout } from 'antd';

const { Footer: AntFooter } = Layout;

export const Footer: React.FC = () => {
  return (
    <AntFooter style={{ textAlign: 'center', background: '#f0f2f5' }}>
      Parking Management System ©2025 Created by ParkEase
    </AntFooter>
  );
};
