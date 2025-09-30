"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { api } from "@/convex/_generated/api";
import { useMutationState } from "@/hooks/useMutationState";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "convex/react";
import { ConvexError } from "convex/values";
import { CirclePlus, X, Users } from "lucide-react";
import React, { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

const createGroupFormSchema = z.object({
  name: z.string().min(1, { message: "This field can't be empty" }),
  members: z
    .array(z.string())
    .min(1, { message: "You must select at least one friend" }),
});

const CreateGroupDialog = () => {
  const friends = useQuery(api.friends.get);
  const [open, setOpen] = useState(false);

  const { mutate: createGroup, pending } = useMutationState(
    api.conversation.createGroup
  );

  const form = useForm<z.infer<typeof createGroupFormSchema>>({
    resolver: zodResolver(createGroupFormSchema),
    defaultValues: {
      name: "",
      members: [],
    },
  });

  const members = form.watch("members", []);
  const groupName = form.watch("name");

  const unselectedFriends = useMemo(() => {
    return friends
      ? friends.filter((friend) => !members.includes(friend._id))
      : [];
  }, [members, friends]);

  // Calculate total members (selected friends + current user)
  const totalMembers = members.length + 1; // +1 for the current user

  const handleSubmit = async (
    values: z.infer<typeof createGroupFormSchema>
  ) => {
    console.log("=== FORM SUBMISSION ===");
    console.log("Submitting form with values:", values);

    try {
      const result = await createGroup({
        name: values.name,
        members: values.members,
      });

      console.log("Mutation result:", result);
      toast.success("Group created successfully");
      form.reset();
      setOpen(false);
    } catch (error) {
      console.error("Error creating group:", error);
      toast.error(
        error instanceof ConvexError ? error.data : "Failed to create group"
      );
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    console.log("Dialog open state changing to:", isOpen);
    setOpen(isOpen);
    if (!isOpen) {
      // Reset form when dialog closes
      form.reset();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="icon"
            variant="outline"
            onClick={() => {
              console.log("Button clicked - opening dialog");
              setOpen(true);
            }}
          >
            <CirclePlus className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Create Group</p>
        </TooltipContent>
      </Tooltip>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Group</DialogTitle>
          <DialogDescription>
            Add your friends to get started!
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel>Group Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter group name..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            {/* Members Count Display */}
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Group Members</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {totalMembers} {totalMembers === 1 ? "member" : "members"}
                </span>
                <div className="flex items-center gap-1 px-2 py-1 bg-background rounded-full border">
                  <span className="text-xs font-medium">
                    {members.length}{" "}
                    {members.length === 1 ? "friend" : "friends"} + you
                  </span>
                </div>
              </div>
            </div>

            <FormField
              control={form.control}
              name="members"
              render={() => {
                return (
                  <FormItem>
                    <FormLabel>Add Friends</FormLabel>
                    <FormControl>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full"
                            disabled={unselectedFriends.length === 0}
                            type="button"
                          >
                            {unselectedFriends.length === 0
                              ? "No friends available"
                              : `Select friends (${unselectedFriends.length} available)`}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-full max-h-60 overflow-y-auto">
                          {unselectedFriends.map((friend) => {
                            return (
                              <DropdownMenuCheckboxItem
                                key={friend._id}
                                className="flex items-center gap-2 w-full p-2"
                                checked={members.includes(friend._id)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    form.setValue(
                                      "members",
                                      [...members, friend._id],
                                      { shouldValidate: true }
                                    );
                                  }
                                }}
                              >
                                <Avatar className="w-6 h-6">
                                  <AvatarImage src={friend.imageUrl} />
                                  <AvatarFallback>
                                    {friend.username?.substring(0, 1)}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="truncate">
                                  {friend.username}
                                </span>
                              </DropdownMenuCheckboxItem>
                            );
                          })}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            {members.length > 0 && (
              <div className="space-y-2">
                <FormLabel>Selected Friends ({members.length})</FormLabel>
                <Card className="flex items-center gap-3 overflow-x-auto p-3 min-h-20">
                  {friends
                    ?.filter((friend) => members.includes(friend._id))
                    .map((friend) => {
                      return (
                        <div
                          key={friend._id}
                          className="flex flex-col items-center gap-1 flex-shrink-0"
                        >
                          <div className="relative group">
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={friend.imageUrl} />
                              <AvatarFallback>
                                {friend.username?.substring(0, 1)}
                              </AvatarFallback>
                            </Avatar>
                            <Button
                              type="button"
                              className="absolute -top-1 -right-1 bg-muted rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground"
                              onClick={() => {
                                form.setValue(
                                  "members",
                                  members.filter((id) => id !== friend._id),
                                  { shouldValidate: true }
                                );
                              }}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                          <p className="text-xs truncate max-w-16">
                            {friend.username?.split(" ")[0]}
                          </p>
                        </div>
                      );
                    })}
                </Card>
              </div>
            )}

            {/* Create Button with Member Count */}
            <DialogFooter>
              <Button
                type="submit"
                disabled={pending || !form.formState.isValid}
                className="w-full"
              >
                {pending ? (
                  "Creating..."
                ) : (
                  <div className="flex items-center gap-2">
                    <span>Create Group</span>
                    {totalMembers > 0 && (
                      <span className="text-xs bg-background/50 px-2 py-1 rounded-full">
                        {totalMembers}{" "}
                        {totalMembers === 1 ? "member" : "members"}
                      </span>
                    )}
                  </div>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateGroupDialog;
