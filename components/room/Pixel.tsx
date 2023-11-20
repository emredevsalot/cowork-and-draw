"use client";

type Props = {
  selectedColor: string;
};

// This component represents an individual pixel within the canvas.
const Pixel = ({ selectedColor }: Props) => {
  return (
    <div
      className={`w-10 h-10 border flex justify-center items-center`}
      style={{ backgroundColor: selectedColor }}
    ></div>
  );
};

export default Pixel;
