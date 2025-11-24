import { toast } from 'react-hot-toast';

export const smartToast = {
    success: (message: string) => {
        const isPositive = /success|created|updated|saved|completed|added|done|✓|✅/i.test(message);
        const isWarning = /warning|caution|attention|note|important|⚠️/i.test(message);

        let textColor = '#10B981'; // Default success green

        if (isWarning) {
            textColor = '#F59E0B'; // Amber for warnings
        } else if (isPositive) {
            textColor = '#10B981'; // Green for positive messages
        }

        toast.success(message, {
            style: {
                background: 'rgba(16, 185, 129, 0.1)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: textColor,
                borderRadius: '16px',
                fontSize: '14px',
                fontWeight: '500',
                padding: '12px 20px',
                boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.36)',
            },
            iconTheme: {
                primary: textColor,
                secondary: '#fff',
            },
        });
    },

    error: (message: string) => {
        const isCritical = /error|failed|invalid|wrong|incorrect|missing|❌|🚫/i.test(message);
        const isWarning = /warning|caution|attention|note|⚠️/i.test(message);

        let textColor = '#EF4444'; // Default error red

        if (isWarning) {
            textColor = '#F59E0B'; // Amber for warnings
        } else if (isCritical) {
            textColor = '#DC2626'; // Darker red for critical errors
        }

        toast.error(message, {
            style: {
                background: 'rgba(239, 68, 68, 0.1)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: textColor,
                borderRadius: '16px',
                fontSize: '14px',
                fontWeight: '500',
                padding: '12px 20px',
                boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.36)',
            },
            iconTheme: {
                primary: textColor,
                secondary: '#fff',
            },
        });
    },

    info: (message: string) => {
        const isImportant = /important|note|attention|ℹ️/i.test(message);
        const isUpdate = /updated|changed|modified|🔄/i.test(message);

        let textColor = '#3B82F6'; // Default info blue

        if (isImportant) {
            textColor = '#8B5CF6'; // Purple for important info
        } else if (isUpdate) {
            textColor = '#06B6D4'; // Cyan for updates
        }

        toast(message, {
            style: {
                background: 'rgba(59, 130, 246, 0.1)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                color: textColor,
                borderRadius: '16px',
                fontSize: '14px',
                fontWeight: '500',
                padding: '12px 20px',
                boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.36)',
            },
            icon: 'ℹ️',
        });
    },

    warning: (message: string) => {
        toast(message, {
            style: {
                background: 'rgba(245, 158, 11, 0.1)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                color: '#F59E0B', // Amber for warnings
                borderRadius: '16px',
                fontSize: '14px',
                fontWeight: '500',
                padding: '12px 20px',
                boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.36)',
            },
            icon: '⚠️',
        });
    },

    loading: (message: string) => {
        toast.loading(message, {
            style: {
                background: 'rgba(59, 130, 246, 0.1)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                color: '#3B82F6', // Blue for loading
                borderRadius: '16px',
                fontSize: '14px',
                fontWeight: '500',
                padding: '12px 20px',
                boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.36)',
            },
        });
    },
};