"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutationState } from "@/hooks/useMutationState";
import React, { SetStateAction, Dispatch } from "react";
import { toast } from "sonner";

type Props = {
  conversationId: Id<"conversations">;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
};

const RemoveFriendDialog = ({ conversationId, open, setOpen }: Props) => {
  const { mutate: removeFriend, pending } = useMutationState(api.friend.remove);
  const handleRemoveFriend = async () => {
    removeFriend({ conversationId })
      .then(() => {
        toast.success("Friend removed successfully");
      })
      .catch(() => {
        toast.error("Failed to remove friend");
      });
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
       
        <AlertDialogHeader>
          <AlertDialogTitle>Are you Sure?</AlertDialogTitle>
          <AlertDialogDescription>This action Can not be Undone! All messages will be deleted and you will not be able to message this user. All Group chats will still work as Normal.</AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
          <AlertDialogAction disabled={pending} onClick={handleRemoveFriend}>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default RemoveFriendDialog;
