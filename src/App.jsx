import { Route, Routes, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import AdminLayout from './pages/admin/AdminLayout'
import RestaurantsPage from './pages/admin/RestaurantsPage'
import ActivityLogPage from './pages/admin/ActivityLogPage'
import DashboardLayout from './pages/dashboard/DashboardLayout'
import DashboardHome from './pages/dashboard/DashboardHome'
import DeliveryPage from './pages/dashboard/DeliveryPage'
import DishesPage from './pages/dashboard/DishesPage'
import OrdersPage from './pages/dashboard/OrdersPage'
import SubscriptionPage from './pages/dashboard/SubscriptionPage'
import ProfilePage from './pages/dashboard/ProfilePage'
import StaffPage from './pages/dashboard/StaffPage'
import HomePage from './pages/public/HomePage'
import RestaurantsListPage from './pages/public/RestaurantsListPage'
import RestaurantPage from './pages/public/RestaurantPage'
import DishDetailPage from './pages/public/DishDetailPage'
import CartPage from './pages/public/CartPage'
import CheckoutPage from './pages/public/CheckoutPage'
import OrderTrackingPage from './pages/public/OrderTrackingPage'
import MyOrdersPage from './pages/public/MyOrdersPage'

function App() {
  const location = useLocation()
  const isBackOffice =
    location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/admin')

  return (
    <div className="flex min-h-screen flex-col">
      {!isBackOffice && <Navbar />}
      <div className="flex-1">
        <Routes>
          {/* Public */}
          <Route path="/" element={<HomePage />} />
          <Route path="/restaurants" element={<RestaurantsListPage />} />
          <Route path="/restaurants/:slug" element={<RestaurantPage />} />
          <Route path="/plats/:id" element={<DishDetailPage />} />
          <Route path="/panier" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/commandes/:code" element={<OrderTrackingPage />} />
          <Route path="/mes-commandes" element={<MyOrdersPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/inscription" element={<RegisterPage />} />

          {/* Espace restaurant */}
          <Route
            element={
              <ProtectedRoute
                allowedRoles={['restaurant_owner', 'staff']}
              />
            }
          >
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<DashboardHome />} />
              <Route path="dishes" element={<DishesPage />} />
              <Route path="orders" element={<OrdersPage />} />
              <Route path="delivery" element={<DeliveryPage />} />
              <Route path="subscription" element={<SubscriptionPage />} />
              <Route path="profil" element={<ProfilePage />} />
              <Route element={<ProtectedRoute allowedRoles={['restaurant_owner']} />}>
                <Route path="equipe" element={<StaffPage />} />
              </Route>
            </Route>
          </Route>

          {/* Super admin */}
          <Route element={<ProtectedRoute allowedRoles={['super_admin']} />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<RestaurantsPage />} />
              <Route path="activite" element={<ActivityLogPage />} />
            </Route>
          </Route>
        </Routes>
      </div>
      {!isBackOffice && <Footer />}
    </div>
  )
}

export default App
