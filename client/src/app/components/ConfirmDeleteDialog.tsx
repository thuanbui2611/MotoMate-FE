import {
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from "@material-tailwind/react";
import { LoadingButton } from "@mui/lab";
import { useState } from "react";

interface Props {
  actionTitle?: string;
  actionName?: string;
  objectName: string;
  content?: string;
  color?: "red" | "blue" | "green";
  actionDelete: () => Promise<void>;
  onClose: () => void;
}
export default function ConfirmDeleteDialog({
  actionTitle,
  actionName,
  objectName,
  content,
  onClose,
  actionDelete,
  color,
}: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const onDelete = async () => {
    setIsSubmitting(true);

    await actionDelete();
  };
  return (
    <>
      <Dialog
        open={true}
        handler={onClose}
        size="sm"
        className="md:max-w-xl max-w-xs"
      >
        <DialogHeader
          className={`text-3xl font-bold px-8 ${
            color === "red"
              ? "text-red-600"
              : color === "blue"
              ? "text-blue-600"
              : "text-green-600"
          }`}
        >
          {actionTitle ? actionTitle : "Confirm Delete"}
        </DialogHeader>
        <DialogBody divider className="px-8">
          <p
            className={`text-xl font-bold mb-3 ${
              color === "red"
                ? "text-red-600"
                : color === "blue"
                ? "text-blue-600"
                : "text-green-600"
            }`}
          >
            You should read this carefully!
          </p>
          {actionName === "Completed" ? (
            <p className="text-base font-medium">
              Only vehicles that are{" "}
              <span className="text-orange-based">on going</span> and
              <span className="text-blue-600"> pending</span> will be completed.
            </p>
          ) : (
            // Approved vehicles
            <p className="text-base font-medium">
              Only vehicles that are{" "}
              <span className="text-blue-600"> pending</span> will be approved.
            </p>
          )}

          <p className="text-base font-medium">
            {content ? content : "Are you sure you want to delete:"}
            <span className="font-bold ml-2">{objectName}</span>
          </p>
        </DialogBody>
        <DialogFooter>
          <Button variant="text" color="red" onClick={onClose} className="mr-1">
            <span>Cancel</span>
          </Button>
          <LoadingButton
            size="large"
            className="transition-all rounded-lg shadow-md"
            loading={isSubmitting}
            color={
              color === "red" ? "error" : color === "blue" ? "info" : "success"
            }
            onClick={() => onDelete()}
            variant="contained"
          >
            <span
              className={`font-bold text-xs ${
                isSubmitting ? "text-transparent" : "text-white"
              }`}
            >
              Confirm
            </span>
          </LoadingButton>
        </DialogFooter>
      </Dialog>
    </>
  );
}
