import { createContext, useContext, useState, useEffect } from 'react';
import API from '../utils/api';

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    appName: 'Tournament Guru',
    appLogo: '',
    appDescription: 'বাংলাদেশের সেরা গেমিং টুর্নামেন্ট প্ল্যাটফর্ম',
    bkashNumber: '01776469016',
    nagadNumber: '01983626780',
    rocketNumber: '019836267807',
    socialYoutube: '',
    socialTelegram: '',
    socialWhatsapp: '',
    socialFacebook: '',
    minAddMoney: 20,
    minWithdraw: 50,
    announcement: '',
    primaryColor: '#7C3AED',
    heroText: 'খেলো, জিতো, উপভোগ করো!',
    banner_freefire_classic: '',
    banner_freefire_clash: '',
    banner_freefire_1v1: '',
    banner_freefire_lonewolf: '',
    banner_pubg_classic: '',
    banner_pubg_tdm: '',
  });

  useEffect(() => {
    API.get('/settings').then(res => {
      setSettings(prev => ({ ...prev, ...res.data }));
    }).catch(() => {});
  }, []);

  const refreshSettings = async () => {
    const res = await API.get('/settings');
    setSettings(prev => ({ ...prev, ...res.data }));
  };

  return (
    <SettingsContext.Provider value={{ settings, refreshSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
