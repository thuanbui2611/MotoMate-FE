import {
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
} from "@material-tailwind/react";
import { LoadingButton } from "@mui/lab";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { Image } from "../../app/models/Image";
import { Shop, Vehicle } from "../models/TripRequest";
import { useAppDispatch, useAppSelector } from "../store/ConfigureStore";
import { uploadImages } from "../utils/Cloudinary";
import agent from "../api/agent";
import { FieldValues, useForm } from "react-hook-form";
import AppTextInput from "./AppTextInput";
interface Props {
  vehicle: Vehicle | null;
  shop: Shop | null;
  onClose: () => void;
}
type ImageFile = {
  name?: string | null;
  url: string | null;
};
export default function ReviewFormDialog({ vehicle, shop, onClose }: Props) {
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [imagesSelected, setImagesSelected] = useState<ImageFile[] | null>(
    null
  );
  const [rating, setRating] = useState<number>();
  const { userDetail } = useAppSelector((state) => state.account);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    control,
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm({
    mode: "all",
  });

  const dispatch = useAppDispatch();

  useEffect(() => {
    //add selected images when user upload
    if (selectedFiles) {
      const imagesSelected: ImageFile[] = [];
      // Set image from user upload
      // Convert selectedFiles to selectedImages
      for (let i = 0; i < selectedFiles?.length; i++) {
        const file = selectedFiles[i];
        const name = file.name;
        const url = URL.createObjectURL(file);
        imagesSelected.push({ name, url });
      }
      setImagesSelected(imagesSelected);
    }
  }, [selectedFiles]);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    setSelectedFiles((prevFiles) => {
      // Check type
      for (let i = 0; i < files?.length!; i++) {
        if (!files![i].type.startsWith("image/")) {
          toast.error("Accept only image file");
          return prevFiles;
        }
      }
      // Check limit file upload
      if (files?.length! > 5) {
        toast.error("You can only upload 5 images");
        return prevFiles;
      }
      // Check prev files limit
      if (imagesSelected && imagesSelected.length + files!.length > 5) {
        toast.error("You can only use 5 images");
        return prevFiles;
      }
      if (prevFiles) {
        // Convert the FileList to an array
        const prevFilesArray = Array.from(prevFiles);
        // Convert the new files to an array
        const newFilesArray = Array.from(files || []);
        // Concatenate the previous and new files arrays
        const combinedFilesArray = [...prevFilesArray, ...newFilesArray];
        // Convert the combined files array back to a FileList
        const combinedFilesList = createFileList(combinedFilesArray);
        return combinedFilesList;
      }
      // If there were no previous files, simply use the new FileList

      return files;
    });
  };
  const createFileList = (files: File[]) => {
    const dataTransfer = new DataTransfer();
    files.forEach((file) => {
      dataTransfer.items.add(file);
    });
    return dataTransfer.files;
  };
  const removeImageFromList = (file: ImageFile, index: number) => {
    if (selectedFiles) {
      //Remove image from user upload
      const fileList = Array.from(selectedFiles);
      fileList.splice(index, 1);
      setSelectedFiles(createFileList(fileList));
    }
  };

  async function onSubmit(data: FieldValues) {
    try {
      if (rating === undefined) {
        toast.error("Please rate your experience");
        return;
      }
      let imagesReview: Image[] | null = [];
      const formData = {
        requestId: vehicle?.requestId,
        userId: userDetail?.id,
        title: data.title,
        content: data.content,
        rating: rating,
        images: imagesReview,
      };
      // Upload images

      if (selectedFiles) {
        let images = await uploadImages(selectedFiles);
        formData.images = images!;
      }

      await agent.TripRequest.reviewVehicle(formData);
      toast.success("Review successfully");
      onClose();
    } catch (error: any) {
      toast.error(error.message);
      console.log("Review error:", error);
    }
  }

  return (
    <>
      <Dialog
        open={true}
        handler={onClose}
        size="sm"
        className="md:max-w-xl max-w-xs max-h-[700px] overflow-auto scrollbar"
      >
        <DialogHeader className="text-red-600 text-3xl font-bold px-8 justify-center">
          Review
        </DialogHeader>
        <DialogBody
          divider
          className="px-8 flex flex-col items-center justify-center gap-4"
        >
          <div className="w-full">
            <div className="flex items-center justify-start mb-4">
              <div className="w-fit rounded p-2 pl-0">
                <div className="flex items-center text-black">
                  {/* img size 32x32 */}
                  <img
                    alt="Placeholder"
                    className="block rounded-full h-8 w-8"
                    src={shop?.lessorImage}
                  />
                  <div className="ml-2 text-sm font-bold">
                    {shop?.lessorName}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col md:flex-row justify-center items-center md:space-x-6 xl:space-x-8 w-fit mx-auto p-3 border bg-gray-100 border-gray-500 rounded-lg">
              <div className="flex justify-center items-center w-full md:w-32 mb-4 md:mb-0">
                <img
                  className="w-[120px] h-[120px] md:w-full md:h-full md:block rounded-lg"
                  src={vehicle?.image}
                  alt="dress"
                />
              </div>
              <div className="flex justify-start items-start h-full md:flex-row flex-col md:w-fit space-y-4 md:space-y-0">
                <div className="w-full flex flex-col justify-start items-start space-y-2">
                  <h3 className="text-xl xl:text-2xl font-bold leading-6 text-black">
                    {vehicle?.vehicleName}
                  </h3>
                  <div className="flex justify-start items-start flex-col space-y-2">
                    <p className="text-sm leading-none text-black font-medium">
                      <span className="text-gray-500 font-bold">Brand: </span>
                      {vehicle?.brand}
                    </p>
                    <p className="text-sm leading-none text-black font-medium">
                      <span className="text-gray-500 font-bold">Color: </span>{" "}
                      {vehicle?.color}
                    </p>
                    <p className="text-sm leading-none text-black font-medium">
                      <span className="text-gray-500 font-bold">
                        License plates:{" "}
                      </span>
                      {vehicle?.licensePlate}
                    </p>
                    <p className="text-sm leading-none text-black font-medium">
                      <span className="text-green-600 font-bold">Price: </span>
                      {vehicle?.price.toLocaleString()} VND
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <hr className="w-1/4 mt-1 border-gray-300" />
          <form
            className="flex flex-col w-full gap-4"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="flex items-start justify-start gap-4">
              <p className="font-bold text-sm w-[79px] md:w-[66px]">Title:</p>
              <AppTextInput
                control={control}
                multiline
                maxRows={3}
                placeholder="That was a great experience!"
                sx={{
                  "& .MuiOutlinedInput-input": {
                    boxShadow: "none",
                    fontSize: "14px",
                  },
                  "& .MuiInputBase-root": {
                    padding: 1,
                    fontSize: "14px",
                  },
                }}
                {...register("title", {
                  required: "You must provide a title for your review.",
                  pattern: {
                    value:
                      /^(?!.*[<>])(?!.*<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>)(?!.*\b(xss|XSS)\b).*$/i,
                    message: "Invalid title",
                  },
                })}
              />
            </div>
            <div className="flex items-start justify-start gap-4">
              <p className="font-bold text-sm">Content:</p>
              <AppTextInput
                control={control}
                multiline
                rows={2}
                maxRows={5}
                placeholder="The vehicle was in good condition and the owner was very friendly..."
                sx={{
                  "& .MuiOutlinedInput-input": {
                    boxShadow: "none",
                    fontSize: "14px",
                  },
                  "& .MuiInputBase-root": {
                    padding: 1,
                    fontSize: "14px",
                  },
                }}
                {...register("content", {
                  required: "You must provide a content for your review.",
                  pattern: {
                    value:
                      /^(?!.*[<>])(?!.*<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>)(?!.*\b(xss|XSS)\b).*$/i,
                    message: "Invalid content",
                  },
                })}
              />
            </div>
            <div className="mb-1">
              <p className="block font-bold text-sm">Images</p>
              {!imagesSelected && (
                <div className="mb-8 mt-2">
                  <input
                    type="file"
                    name="logo"
                    id="file"
                    className="sr-only"
                    onChange={handleImageChange}
                    accept="image/*"
                    ref={fileInputRef}
                    multiple
                  />
                  <label
                    htmlFor="file"
                    className="relative flex min-h-[200px] items-center justify-center rounded-md border border-dashed border-[#e0e0e0] p-12 text-center hover:bg-gray-100 cursor-pointer"
                  >
                    <div>
                      <span className="mb-2 block text-xl font-semibold text-[#07074D]">
                        Drop image here
                      </span>
                      <span className="mb-2 block text-base font-medium text-[#6B7280]">
                        Or
                      </span>
                      <span className="inline-flex rounded border border-[#e0e0e0] py-2 px-7 text-base font-medium text-[#07074D]">
                        Browse
                      </span>
                    </div>
                  </label>
                </div>
              )}
            </div>

            {imagesSelected && (
              <div className="flex h-[190px]  mb-5 rounded-md bg-[#F5F7FB] py-4 px-8 w-full scrollbar overflow-auto">
                <div className="flex gap-3">
                  {imagesSelected.map((image, index) => (
                    <div className="w-40 pb-4" key={index}>
                      <div className="flex items-center justify-between pb-1 ">
                        <span className="truncate text-xs font-medium text-[#07074D]">
                          {image.name}
                        </span>
                        <div
                          className="text-[#07074D] cursor-pointer hover:text-red-600"
                          onClick={() => removeImageFromList(image, index)}
                        >
                          <svg
                            width="10"
                            height="10"
                            viewBox="0 0 10 10"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M0.279337 0.279338C0.651787 -0.0931121 1.25565 -0.0931121 1.6281 0.279338L9.72066 8.3719C10.0931 8.74435 10.0931 9.34821 9.72066 9.72066C9.34821 10.0931 8.74435 10.0931 8.3719 9.72066L0.279337 1.6281C-0.0931125 1.25565 -0.0931125 0.651788 0.279337 0.279338Z"
                              fill="currentColor"
                            />
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M0.279337 9.72066C-0.0931125 9.34821 -0.0931125 8.74435 0.279337 8.3719L8.3719 0.279338C8.74435 -0.0931127 9.34821 -0.0931123 9.72066 0.279338C10.0931 0.651787 10.0931 1.25565 9.72066 1.6281L1.6281 9.72066C1.25565 10.0931 0.651787 10.0931 0.279337 9.72066Z"
                              fill="currentColor"
                            />
                          </svg>
                        </div>
                      </div>
                      <div className="flex"></div>
                      <img
                        className="h-full w-full"
                        src={image.url || undefined}
                        alt="Review Images"
                      />
                    </div>
                  ))}
                  {imagesSelected && imagesSelected?.length < 5 && (
                    <div className=" border w-40 h-full">
                      <input
                        type="file"
                        name="logo"
                        id="file"
                        className="sr-only"
                        onChange={handleImageChange}
                        accept="image/*"
                        ref={fileInputRef}
                        multiple
                      />
                      <label
                        htmlFor="file"
                        className="w-full h-full flex flex-col justify-center items-center hover:bg-blue-gray-50 cursor-pointer"
                      >
                        <svg
                          width="30px"
                          height="30px"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                          <g
                            id="SVGRepo_tracerCarrier"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          ></g>
                          <g id="SVGRepo_iconCarrier">
                            <circle
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="#1C274C"
                              strokeWidth="1.2"
                            ></circle>
                            <path
                              d="M15 12L12 12M12 12L9 12M12 12L12 9M12 12L12 15"
                              stroke="#1C274C"
                              strokeWidth="1.2"
                              strokeLinecap="round"
                            ></path>
                          </g>
                        </svg>
                        <span className=" text-xs font-medium ml-1">
                          Add more images
                        </span>
                      </label>
                    </div>
                  )}
                </div>
              </div>
            )}
            <div className="flex items-start md:items-center justify-start gap-4">
              <p className="font-bold text-sm w-[60px]">Rating:</p>
              <div className="flex flex-col md:flex-row items-center">
                <div className="rating">
                  <input
                    hidden
                    value="1"
                    name="star-radio"
                    id="star-1"
                    type="radio"
                  />
                  <label htmlFor="star-1" onClick={() => setRating(5)}>
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z"
                        pathLength="360"
                      ></path>
                    </svg>
                  </label>
                  <input
                    hidden
                    value="2"
                    name="star-radio"
                    id="star-2"
                    type="radio"
                  />
                  <label htmlFor="star-2" onClick={() => setRating(4)}>
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z"
                        pathLength="360"
                      ></path>
                    </svg>
                  </label>
                  <input
                    hidden
                    value="3"
                    name="star-radio"
                    id="star-3"
                    type="radio"
                  />
                  <label htmlFor="star-3" onClick={() => setRating(3)}>
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z"
                        pathLength="360"
                      ></path>
                    </svg>
                  </label>
                  <input
                    hidden
                    value="4"
                    name="star-radio"
                    id="star-4"
                    type="radio"
                  />
                  <label htmlFor="star-4" onClick={() => setRating(2)}>
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z"
                        pathLength="360"
                      ></path>
                    </svg>
                  </label>
                  <input
                    hidden
                    value="5"
                    name="star-radio"
                    id="star-5"
                    type="radio"
                  />
                  <label htmlFor="star-5" onClick={() => setRating(1)}>
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z"
                        pathLength="360"
                      ></path>
                    </svg>
                  </label>
                </div>

                <span className="text-gradient ml-0 md:ml-3 font-bold">
                  {rating === 1
                    ? "Very bad"
                    : rating === 2
                    ? "Bad"
                    : rating === 3
                    ? "Normal"
                    : rating === 4
                    ? "Good"
                    : rating === 5
                    ? "Excellent"
                    : "Rating"}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-center gap-4 pt-4 border-t border-gray-200">
              <Button
                variant="text"
                color="red"
                onClick={onClose}
                className="mr-1 hover:bg-gray-200"
              >
                <span>Cancel</span>
              </Button>
              <LoadingButton
                size="large"
                className="transition-all rounded-lg shadow-md"
                loading={isSubmitting}
                color="error"
                type="submit"
                variant="contained"
              >
                <span className={`font-bold text-xs `}>Confirm</span>
              </LoadingButton>
            </div>
          </form>
        </DialogBody>
        {/* <DialogFooter className="items-center justify-center gap-5"></DialogFooter> */}
      </Dialog>
    </>
  );
}
