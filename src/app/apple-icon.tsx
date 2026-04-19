import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: 180,
                    height: 180,
                    borderRadius: 36,
                    background: 'linear-gradient(140deg, #5b7cfa 0%, #3b4fd4 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <svg
                    viewBox="0 0 40 40"
                    width="110"
                    height="110"
                    fill="none"
                    stroke="white"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    {/* C arc */}
                    <path d="M 29 11 A 12 12 0 1 0 29 29" />
                    {/* S curve */}
                    <path d="M 24 14 C 17 13, 14.5 17, 18.5 20 C 22 22.5, 22 26, 15 27" />
                </svg>
            </div>
        ),
        { ...size },
    );
}
