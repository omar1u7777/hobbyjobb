import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { jobService } from '../services/jobService.js';
import { useAuth } from '../hooks/useAuth.js';
import { formatPrice, formatDate } from '../utils/formatters.js';
import Alert from '../components/common/Alert.jsx';
import Modal from '../components/common/Modal.jsx';
import Spinner from '../components/common/Spinner.jsx';
export default function JobDetailPage() {
  const { id } = useParams(); const { user } = useAuth(); const navigate = useNavigate();
  const [job, setJob] = useState(null); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  const [applyOpen, setApplyOpen] = useState(false); const [applyMsg, setApplyMsg] = useState(''); const [applyErr, setApplyErr] = useState(''); const [applyOk, setApplyOk] = useState(false); const [applyLoading, setApplyLoading] = useState(false);
  useEffect(() => { setLoading(true); jobService.getJob(id).then(setJob).catch(e => setError(e.message)).finally(() => setLoading(false)); }, [id]);
  if (loading) return <div style={{ padding: '80px 0', textAlign: 'center' }}><Spinner /></div>;
  if (error) return <div className="container" style={{ padding: 60 }}><Alert type="error">{error}</Alert></div>;
  const isOwner = user?.id === job.poster_id;
}
