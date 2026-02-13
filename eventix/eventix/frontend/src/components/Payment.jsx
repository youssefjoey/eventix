import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { reservationService, paymentService, eventService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CreditCard, Wallet, Landmark, ArrowLeft, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Payment = () => {
    const { reservationId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const isProcessed = useRef(false);

    const [reservation, setReservation] = useState(null);
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('CARD');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await reservationService.getReservationById(reservationId);
                console.log('📝 Reservation Data:', res.data);
                setReservation(res.data);

                const eventRes = await eventService.getEventById(res.data.event_id);
                console.log('📅 Event Data for Payment:', eventRes.data);
                setEvent(eventRes.data);
            } catch (err) {
                setError("Failed to load reservation details.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();

        // Cleanup: if user leaves the page without successful payment, cancel reservation
        return () => {
            if (!isProcessed.current && reservationId) {
                console.log("♻️ Auto-cancelling unfinished reservation:", reservationId);
                reservationService.cancelReservation(reservationId).catch(err =>
                    console.error("Failed to auto-cancel reservation:", err)
                );
            }
        };
    }, [reservationId]);

    // Update success ref to prevent auto-cancellation on successful payment redirect
    useEffect(() => {
        if (success) {
            isProcessed.current = true;
        }
    }, [success]);

    const handleBack = async () => {
        // Explicitly cancel before going back
        try {
            setLoading(true); // Show spinner while cancelling
            await reservationService.cancelReservation(reservationId);
            isProcessed.current = true; // Mark as processed so cleanup doesn't fire again
            navigate(-1);
        } catch (err) {
            console.error("Error during manual back cancellation:", err);
            navigate(-1);
        }
    };

    const handlePayment = async () => {
        try {
            setSubmitting(true);
            setError(null);

            const totalPrice = (event.priceBase * reservation.seats_reserved).toFixed(2);

            await paymentService.createPayment({
                reservation_id: parseInt(reservationId),
                amount: parseFloat(totalPrice),
                method: paymentMethod,
                status: 'SUCCESS'
            });

            setSuccess(true);
            setTimeout(() => navigate('/my-tickets'), 2500);
        } catch (err) {
            setError(err.response?.data?.message || "Payment processing failed. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="spinner"></div></div>;
    if (!reservation || !event) return <div className="container" style={{ padding: '150px 0', textAlign: 'center' }}><h2>RESERVATION NOT FOUND</h2><button onClick={() => navigate('/events')} className="btn-secondary">BACK TO EXPLORE</button></div>;

    const totalPrice = (event.priceBase * reservation.seats_reserved).toFixed(2);

    const methods = [
        { id: 'CARD', label: 'Credit Card', icon: <CreditCard size={20} />, description: 'Visa, Mastercard, Amex' },
        { id: 'PAYPAL', label: 'PayPal', icon: <Landmark size={20} />, description: 'Fast and secure checkout' },
        { id: 'WALLET', label: 'E-Wallet', icon: <Wallet size={20} />, description: 'Apple Pay, Google Pay, etc.' }
    ];

    return (
        <div className="container" style={{ paddingTop: '160px', paddingBottom: '150px' }}>
            <button
                onClick={handleBack}
                className="btn-secondary"
                style={{ marginBottom: '5rem', padding: '0.8rem 1.8rem', fontSize: '0.7rem', border: 'none', background: 'var(--bg-surface)' }}>
                <ArrowLeft size={16} /> BACK
            </button>

            <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '5rem' }}>

                {/* Reservation Details */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <span style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '0.7rem', letterSpacing: '0.4em', marginBottom: '1.5rem', display: 'block' }}>RESERVATION SUMMARY</span>
                    <h2 style={{ fontSize: '3.5rem', marginBottom: '3rem' }}>Review & <span style={{ color: 'var(--primary)' }}>Settle</span></h2>

                    <div className="card" style={{ padding: '3rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2.5rem', paddingBottom: '2.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <div>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', marginBottom: '0.5rem' }}>EVENT</p>
                                <h4 style={{ fontSize: '1.4rem' }}>{event.name}</h4>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', marginBottom: '0.5rem' }}>SEATS</p>
                                <h4 style={{ fontSize: '1.4rem' }}>{reservation.seats_reserved}</h4>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '3rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-dim)' }}>Price per ticket</span>
                                <span>${event.priceBase.toFixed(2)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-dim)' }}>Service Fee</span>
                                <span>$0.00</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                                <span style={{ fontSize: '1.2rem', fontWeight: 700 }}>Total To Pay</span>
                                <span style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--primary)' }}>${totalPrice}</span>
                            </div>
                        </div>

                        <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <ShieldCheck size={24} color="var(--primary)" />
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', margin: 0 }}>
                                Your transaction is protected by end-to-end encryption. Tickets will be generated instantly upon confirmation.
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Payment Selection */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="card" style={{ padding: '3.5rem' }}>
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '2.5rem' }}>PAYMENT METHOD</h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '3rem' }}>
                            {methods.map((method) => (
                                <div
                                    key={method.id}
                                    onClick={() => setPaymentMethod(method.id)}
                                    style={{
                                        padding: '1.8rem',
                                        borderRadius: '24px',
                                        border: '1px solid',
                                        borderColor: paymentMethod === method.id ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                                        background: paymentMethod === method.id ? 'rgba(var(--primary-rgb), 0.05)' : 'rgba(255,255,255,0.02)',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '1.5rem',
                                        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                                    }}
                                    className="payment-option"
                                >
                                    <div style={{
                                        width: '44px',
                                        height: '44px',
                                        borderRadius: '14px',
                                        background: paymentMethod === method.id ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: paymentMethod === method.id ? '#000' : '#fff'
                                    }}>
                                        {method.icon}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.2rem' }}>{method.label}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{method.description}</div>
                                    </div>
                                    <div style={{
                                        width: '20px',
                                        height: '20px',
                                        borderRadius: '50%',
                                        border: '2px solid',
                                        borderColor: paymentMethod === method.id ? 'var(--primary)' : 'rgba(255,255,255,0.2)',
                                        position: 'relative'
                                    }}>
                                        {paymentMethod === method.id && (
                                            <div style={{
                                                position: 'absolute',
                                                top: '50%', left: '50%',
                                                transform: 'translate(-50%, -50%)',
                                                width: '10px', height: '10px',
                                                background: 'var(--primary)',
                                                borderRadius: '50%'
                                            }} />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {error && <p style={{ color: '#f85149', fontSize: '0.85rem', marginBottom: '2rem', textAlign: 'center' }}>{error}</p>}

                        <button
                            className="btn-primary"
                            style={{ width: '100%', padding: '1.5rem' }}
                            onClick={handlePayment}
                            disabled={submitting || success}
                        >
                            {submitting ? 'PROCESSING...' : success ? 'PAYMENT SUCCESSFUL' : `PAY $${totalPrice}`}
                        </button>

                        <AnimatePresence>
                            {success && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    style={{ marginTop: '2rem', textAlign: 'center', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                >
                                    <CheckCircle2 size={18} />
                                    <span>Redirecting to your passes...</span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <p style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            By confirming, you agree to our Terms of Service.
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Payment;
