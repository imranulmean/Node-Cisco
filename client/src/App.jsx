import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AdminRoute from './components/AdminRoute';
import PrivateRoute from './components/PrivateRouter';
import AddDowntime from './pages/AddDowntime';
import AddRouter from './pages/AddRouter';
import AdminDashboard from './pages/Administration/AdminDashboard';
import CreateUser from './pages/Administration/CreateUser';
import LoginUser from './pages/Administration/LoginUser';
import BackupsPage from './pages/BackupsPage';
import FindIpMatch from './pages/FindIpMatch';
import GenerateReport2 from './pages/GenerateReport2';
import Home from './pages/Home';
import IpPhones from './pages/IpPhones';
import Login from './pages/Login';
import MonitoringPage from './pages/MonitoringPage';
import MrtgPage from './pages/mrtgPage';
import PushConfigPage from './pages/PushConfigPage';
import Rem from './pages/Rem';
import RouterSessions from './pages/RouterSessions';
import SaveToDB from './pages/SaveToDb';
import UpDownStatPage from './pages/UpDownStatPage';
import UploadFiles from './pages/UploadFiles';
import ChangePassword from './pages/Administration/ChangePassword';
import IpScan from './pages/IpScan';
export default function App(){

  return(
    <BrowserRouter>
      <Routes>        
        <Route path='/login' element={<Login />} />
        <Route path='/localfiles' element={<UploadFiles />} />
        <Route path='/findmatches' element={<FindIpMatch />} />
        <Route path='/rem' element={<Rem />} />
        <Route path='/up-down-stat' element={<UpDownStatPage />} />
        <Route path='/monitoring' element={<MonitoringPage />} />
        <Route path='/backups' element={<BackupsPage />} />
        <Route path='/mrtg/:router/:host' element={<MrtgPage />} />
        <Route path='/ipPhones' element={<IpPhones />} />
        <Route path='/administration/login' element={<LoginUser />} />
        <Route path='/ipscan' element={<IpScan />} />
        <Route element={<PrivateRoute />}>           
          <Route path='/' element={<PushConfigPage />} />
          <Route path='/push-config' element={<PushConfigPage />} />
          <Route path='/addRouter' element={<AddRouter />} />
          <Route path='/getRouterSessions' element={<RouterSessions />} />
          <Route path='/saveToDb' element={<SaveToDB />} />
          <Route path='/addDowntime' element={<AddDowntime />} />          
        </Route>

        <Route element={<AdminRoute />}>        
          <Route path='/administration/create' element={<CreateUser />} />      
          <Route path='/administration/dashboard' element={<AdminDashboard />} />
          <Route path='/administration/changePassword' element={<ChangePassword />} />      
          <Route path='/automaticReport' element={<GenerateReport2 />} />
          <Route path='/manualReport' element={<GenerateReport2 />} />
        </Route>

      </Routes>        

    </BrowserRouter>    
  )
}