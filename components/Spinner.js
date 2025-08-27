// components/Spinner.js
import { ClipLoader } from 'react-spinners';

export default function Spinner({ size = 24 }) {
  return (
    <div className="flex justify-center items-center">
      <ClipLoader size={size} />
    </div>
  );
}
