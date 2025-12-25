import React, { useState } from 'react';
import { Eye, EyeOff, LucideIcon } from 'lucide-react';

interface PasswordInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
    icon?: LucideIcon;
    rightElement?: React.ReactNode;
}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
    ({ className = '', icon: Icon, rightElement, ...props }, ref) => {
        const [showPassword, setShowPassword] = useState(false);

        return (
            <div className="relative w-full">
                {Icon && (
                    <Icon className="absolute left-3 top-3 text-slate-400 pointer-events-none" size={18} />
                )}
                <input
                    ref={ref}
                    type={showPassword ? 'text' : 'password'}
                    className={`${className} ${Icon ? 'pl-10' : 'pl-3'} pr-10`}
                    {...props}
                />
                {rightElement && (
                    <div className="absolute right-10 top-3 flex items-center pointer-events-none">
                        {rightElement}
                    </div>
                )}
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                    tabIndex={-1}
                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
            </div>
        );
    }
);

PasswordInput.displayName = 'PasswordInput';

export default PasswordInput;
