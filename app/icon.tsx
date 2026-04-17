import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const size = {
  width: 32,
  height: 32,
}
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(90deg, #ff0000 0%, #ff8000 14.3%, #ffff00 28.6%, #80ff00 42.9%, #00ff00 57.1%, #00ff80 71.4%, #0080ff 85.7%, #8000ff 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '6px',
        }}
      >
        <div
          style={{
            background: '#D946EF',
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            border: '2px solid white',
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  )
}