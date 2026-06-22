'use client';

interface FloatingInputProps {
    label: string;
    name: string;
    type?: 'text' | 'email' | 'textarea';
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    required?: boolean;
}

export function FloatingInput({ label, name, type = 'text', value, onChange, required = false }: FloatingInputProps) {
    const shared =
        'peer block w-full appearance-none border-0 border-b-2 border-foreground/20 bg-transparent py-2.5 px-0 text-xl font-medium text-foreground focus:border-foreground focus:outline-none focus:ring-0 transition-colors duration-300';

    return (
        <div className="group relative z-0 w-full mb-10">
            {type === 'textarea' ? (
                <textarea
                    name={name}
                    value={value}
                    onChange={onChange}
                    required={required}
                    rows={1}
                    className={`${shared} resize-y min-h-[50px] max-h-[200px]`}
                    placeholder=" "
                />
            ) : (
                <input
                    type={type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    required={required}
                    className={shared}
                    placeholder=" "
                />
            )}
            <label className="absolute top-3 -z-10 origin-[0] -translate-y-8 scale-75 transform text-sm font-bold tracking-widest text-muted-foreground duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-8 peer-focus:scale-75 peer-focus:text-foreground">
                {label.toUpperCase()}
            </label>
        </div>
    );
}
