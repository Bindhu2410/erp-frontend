import React, { useState, useRef, useEffect } from "react";
import { FaCamera } from "react-icons/fa";
import { TbCapture } from "react-icons/tb";
import { IoMdClose } from "react-icons/io";
import { FiX } from "react-icons/fi";

export interface CapturedImage {
  id: number;
  src: string;
}

interface CardCaptureProps {
  onUpload: (images: CapturedImage[][]) => Promise<void>;
  onClose: () => void;
}

const CardCapture: React.FC<CardCaptureProps> = ({ onUpload, onClose }) => {
  const [groupedImages, setGroupedImages] = useState<CapturedImage[][]>([]);
  const [groupSize, setGroupSize] = useState<number>(2);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [camera, setCamera] = useState(true);
  const [replaceImage, setReplaceImage] = useState<string | null>(null);
  const [replace, setReplace] = useState(false);
  const [grouped, setGrouped] = useState<CapturedImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (grouped.length > 0 && grouped.length < groupSize) {
      setGroupedImages((prevGroupedImages) => [
        ...prevGroupedImages,
        grouped,
      ]);
    } else if (grouped.length === 2) {
      setGroupedImages((prevGroupedImages) => {
        const updatedGroupedImages = [...prevGroupedImages];
        updatedGroupedImages[updatedGroupedImages.length - 1] = grouped;
        return updatedGroupedImages;
      });
      setGrouped([]);
    }
    else if(grouped.length === groupSize) {
      setGroupedImages((prevGroupedImages) => [
        ...prevGroupedImages,
        grouped,
      ]);
      setGrouped([]);
    }
  }, [grouped, groupSize]);

  useEffect(() => {
    setGrouped([]);
  }, [groupSize]);

  useEffect(() => {
    // Cleanup camera when component unmounts
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setCamera(false);
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      } catch (error) {
        console.error("Error accessing camera:", error);
        setError("Failed to access camera. Please check your camera permissions.");
      }
    } else {
      setError("Camera not supported on this device.");
    }
  };

  const stopCamera = () => {
    setCamera(true);
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const handleReplaceImg = () => {
    setReplace(false);
    startCamera();
  };

  const handleCapture = () => {
    if (canvasRef.current && videoRef.current) {
      const context = canvasRef.current.getContext("2d");
      if (context) {
        context.drawImage(
          videoRef.current,
          0,
          0,
          canvasRef.current.width,
          canvasRef.current.height
        );
        const imageData = canvasRef.current.toDataURL("image/png");
        if (replaceImage) {
          setGroupedImages((prevGroupedImages) => {
            return prevGroupedImages.map((group) =>
              group.map((image) =>
                image.src === replaceImage ? { ...image, src: imageData } : image
              )
            );
          });
          setReplaceImage(null);
          setReplace(false);
        } else {
          const newImage: CapturedImage = { id: Date.now(), src: imageData };
          setGrouped((prevGrouped) => {
            if (prevGrouped.length < groupSize) {
              return [...prevGrouped, newImage];
            }
            return prevGrouped;
          });
        }
      }
    }
  };

  const handleReplace = (imgSrc: string) => {
    setReplace(true);
    setReplaceImage(imgSrc);
    stopCamera();
  };

  const handleRemoveLead = (index: number) => {
    setGroupedImages((prevGroupedImages) => {
      return prevGroupedImages.filter((_, idx) => idx !== index);
    });
  };

  const handleRemove = (id: number) => {
    setGroupedImages((prevGroupedImages) => {
      return prevGroupedImages
        .map((group) => group.filter((image) => image.id !== id))
        .filter((group) => group.length > 0);
    });
  };

  const handleSubmit = async () => {
    if (groupedImages.length > 0) {
      setUploading(true);
      try {
        await onUpload(groupedImages);
      } catch (error) {
        setError("Failed to upload images. Please try again.");
      } finally {
        setUploading(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Card Capture</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FiX size={24} />
          </button>
        </div>

        <div className="w-full text-center">
          <div className="flex justify-center">
            <div className="w-[640px] h-[480px] border-2 rounded-lg overflow-hidden mb-3 bg-gray-300">
              {!!replace ? (
                <img
                  src={replaceImage || ""}
                  alt="Replaced"
                  className="w-full h-full object-cover"
                />
              ) : (
                <video ref={videoRef} className="w-full h-full object-cover" />
              )}
              <canvas ref={canvasRef} width={640} height={480} className="hidden" />
            </div>
          </div>

          <div className="flex gap-4 justify-center items-center mb-3">
            <button
              onClick={camera ? startCamera : handleCapture}
              className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
            >
              {camera ? (
                <div className="flex gap-2 items-center">
                  Camera <FaCamera />
                </div>
              ) : (
                <div className="flex gap-2 items-center">
                  Capture <TbCapture />
                </div>
              )}
            </button>
            {replace && (
              <button
                onClick={handleReplaceImg}
                className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              >
                Replace
              </button>
            )}

            <div>
              <label htmlFor="groupSize" className="mr-2 font-medium">
                Images per Lead:
              </label>
              <select
                id="groupSize"
                value={groupSize}
                onChange={(e) => setGroupSize(Number(e.target.value))}
                className="border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value={1}>1</option>
                <option value={2}>2</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 my-6">
            {groupedImages.map((group, index) => (
              <div key={index} className="mb-4">
                <div className="flex gap-2 items-center justify-between mb-2 border border-gray-300 px-4 py-2 text-white font-bold bg-gray-600 shadow-md rounded-lg">
                  <h3 className="text-lg font-medium">Lead {index + 1}</h3>
                  <button 
                    onClick={() => handleRemoveLead(index)}
                    className="hover:text-gray-300"
                  >
                    <IoMdClose />
                  </button>
                </div>
                <div className="flex gap-3 justify-center">
                  {group.map((image) => (
                    <div
                      key={image.id}
                      className={`relative w-24 h-24 rounded-lg overflow-hidden border border-gray-300 ${
                        replaceImage === image.src ? "ring-2 ring-[#FF6B35]" : ""
                      }`}
                      onClick={() => handleReplace(image.src)}
                    >
                      <img
                        src={image.src}
                        alt={`Captured ${image.id}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemove(image.id);
                        }}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}

          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={groupedImages.length === 0 || uploading}
              className={`px-4 py-2 rounded-lg text-white flex items-center gap-2 ${
                groupedImages.length > 0 && !uploading
                  ? 'bg-[#FF6B35] hover:bg-[#ff8657]'
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardCapture;
