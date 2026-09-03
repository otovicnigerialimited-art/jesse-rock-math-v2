sed -i '/const \[loading, setLoading\] = useState(true);/a \  const [notificationsEnabled, setNotificationsEnabled] = useState(false);' src/components/HomeworkHub.tsx
