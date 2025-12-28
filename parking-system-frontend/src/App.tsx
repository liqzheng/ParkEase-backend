import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import enUS from 'antd/locale/en_US';
import { Layout } from 'antd';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Layout/Navbar';
import { Footer } from './components/Layout/Footer';
import { PrivateRoute } from './components/PrivateRoute';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Spaces } from './pages/Spaces';
import { SpaceDetail } from './pages/SpaceDetail';
import { Reserve } from './pages/Reserve';
import { MyVehicles } from './pages/MyVehicles';
import { MyReservations } from './pages/MyReservations';
import { ParkingRecords } from './pages/ParkingRecords';
import { AdminSpaces } from './pages/host/AdminSpaces';

const { Content } = Layout;

function App() {
  return (
    <ConfigProvider locale={enUS}>
      <AuthProvider>
        <BrowserRouter>
          <Layout style={{ minHeight: '100vh' }}>
            <Navbar />
            <Content style={{ background: '#f0f2f5', flex: 1 }}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/spaces" element={<Spaces />} />
                <Route path="/spaces/:id" element={<SpaceDetail />} />
                <Route path="/reserve/:id" element={<Reserve />} />
                
                {/* Routes requiring authentication */}
                <Route
                  path="/my-vehicles"
                  element={
                    <PrivateRoute>
                      <MyVehicles />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/my-reservations"
                  element={
                    <PrivateRoute>
                      <MyReservations />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/records"
                  element={
                    <PrivateRoute>
                      <ParkingRecords />
                    </PrivateRoute>
                  }
                />
                
                {/* Admin routes */}
                <Route
                  path="/admin/spaces"
                  element={
                    <PrivateRoute requiredRole="ADMIN">
                      <AdminSpaces />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/admin/spaces/new"
                  element={
                    <PrivateRoute requiredRole="ADMIN">
                      <AdminSpaces />
                    </PrivateRoute>
                  }
                />
                
                {/* 404 */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Content>
            <Footer />
          </Layout>
        </BrowserRouter>
      </AuthProvider>
    </ConfigProvider>
  );
}

export default App;
