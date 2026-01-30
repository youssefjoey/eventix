import React, { useEffect, useRef } from 'react';

const Starfield = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let animationFrameId;

        let width = window.innerWidth;
        let height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;

        const stars = [];
        const starCount = 200;

        
        const colors = ['#ffffff', '#ff007a', '#00f2ff', '#bd00ff', '#ffffff'];

        for (let i = 0; i < starCount; i++) {
            stars.push({
                x: Math.random() * width,
                y: Math.random() * height,
                size: Math.random() * 1.5,
                opacity: Math.random(),
                speed: Math.random() * 0.2 + 0.05,
                color: colors[Math.floor(Math.random() * colors.length)]
            });
        }

        const draw = () => {
            
            ctx.fillStyle = 'rgba(2, 4, 8, 0.1)';
            ctx.fillRect(0, 0, width, height);

            stars.forEach(star => {
                ctx.globalAlpha = star.opacity;
                ctx.fillStyle = star.color;

                ctx.beginPath();
                ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
                ctx.fill();

                
                star.y += star.speed;
                if (star.y > height) {
                    star.y = 0;
                    star.x = Math.random() * width;
                }

                
                star.opacity += (Math.random() - 0.5) * 0.02;
                if (star.opacity < 0.1) star.opacity = 0.1;
                if (star.opacity > 0.8) star.opacity = 0.8;
            });

            animationFrameId = requestAnimationFrame(draw);
        };

        const handleResize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        };

        window.addEventListener('resize', handleResize);
        draw();

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: -1,
                pointerEvents: 'none',
                background: '#020408'
            }}
        />
    );
};

export default Starfield;
