import {
    Button,
    Dialog,
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    Typography,
  } from "@material-tailwind/react";
  import AppTextInput from "../../app/components/AppTextInput";
  import { FieldValues, useForm } from "react-hook-form";
  import { Collection } from "../../app/models/Collection";
  import { useEffect } from "react";
  import { useAppDispatch } from "../../app/store/ConfigureStore";
  import { toast } from "react-toastify";
  import { LoadingButton } from "@mui/lab";
import { ModelVehicle } from "../../app/models/ModelVehicle";
import { addModelVehicleAsync, updateModelVehicleAsync } from "./ModelVehicleSlice";
  
  interface Props {
    modelVehicle: ModelVehicle | null;
    cancelEdit: () => void;
    actionName: string;
  }
  
  export default function CollectionForm({
    modelVehicle,
    cancelEdit,
    actionName,
  }: Props) {
    const {
      control,
      reset,
      handleSubmit,
      formState: { isSubmitting, errors },
    } = useForm({
      mode: "all",
    });
  
    useEffect(() => {
      if (modelVehicle) reset(modelVehicle);
    }, [modelVehicle, reset]);
  
    const dispatch = useAppDispatch();
  
    async function submitForm(data: FieldValues) {
      try {
        const formData = {
          id: modelVehicle?.id,
          name: data.name,
          brandId: data.brandId,
        };
        if (modelVehicle) {
          await dispatch(updateModelVehicleAsync(formData));
        } else {
          await dispatch(addModelVehicleAsync(formData));
        }
        cancelEdit();
      } catch (error: any) {
        toast.error("Error: " + error.message);
      }
    }
  
    const onClose = () => {
      cancelEdit();
    };
    return (
      <>
        <Dialog
          size="xs"
          open={true}
          handler={cancelEdit}
          className="bg-transparent shadow-none"
        >
          <Card className="mx-auto w-full max-w-[24rem]">
            <CardHeader className="text-center">
              <Typography
                variant="h3"
                className="text-center py-4 bg-orange-500 text-white rounded-sm dark:bg-boxdark dark:text-white"
              >
                {actionName}
              </Typography>
            </CardHeader>
            <form onSubmit={handleSubmit(submitForm)}>
              <CardBody className="flex flex-col gap-4 overflow-y-auto max-h-[600px]">
                <AppTextInput
                  control={control}
                  name="name"
                  label="Model name"
                />
                <AppTextInput control={control} name="year" label="Year release" />
                <AppTextInput control={control} name="capacity" label="Capacity" />
                <AppTextInput control={control} name="collectionId" label="Collection id" />
                <AppTextInput control={control} name="colorIds[0]" label="Color id" />
              </CardBody>
              <CardFooter className="pt-0 flex flex-row justify-between gap-10">
                <LoadingButton
                  className="bg-gradient-to-tr from-light-blue-600 to-light-blue-400 text-white shadow-md shadow-light-blue-500/20 hover:shadow-lg hover:shadow-light-blue-500/40 active:opacity-[0.85]"
                  loading={isSubmitting}
                  type="submit"
                  variant="contained"
                  color="success"
                >
                  <span className="font-bold">Confirm</span>
                </LoadingButton>
                <Button
                  variant="gradient"
                  color="red"
                  size="lg"
                  onClick={onClose}
                >
                  Cancel
                </Button>
              </CardFooter>
            </form>
          </Card>
        </Dialog>
      </>
    );
  }
  