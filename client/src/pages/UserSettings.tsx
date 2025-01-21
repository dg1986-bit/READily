import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { useUser } from "@/hooks/use-user";

const updateProfileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
});

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(6, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Please confirm your new password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type ProfileFormData = z.infer<typeof updateProfileSchema>;
type PasswordFormData = z.infer<typeof updatePasswordSchema>;

export default function UserSettings() {
  const { user } = useUser();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
    },
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onUpdateProfile = async (data: ProfileFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      toast({
        title: "Success",
        description: "Your profile has been updated",
      });
    } catch (error: any) {
      setError(error.message);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update profile",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onUpdatePassword = async (data: PasswordFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/user/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      toast({
        title: "Success",
        description: "Your password has been updated",
      });
      
      // Reset the password form after successful update
      passwordForm.reset();
    } catch (error: any) {
      setError(error.message);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update password",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Account Settings</h1>
      
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={profileForm.handleSubmit(onUpdateProfile)} className="space-y-4">
              <div>
                <Input
                  placeholder="First Name"
                  {...profileForm.register("firstName")}
                  disabled={isLoading}
                />
                {profileForm.formState.errors.firstName && (
                  <span className="text-xs text-red-500">
                    {profileForm.formState.errors.firstName.message}
                  </span>
                )}
              </div>
              <div>
                <Input
                  placeholder="Last Name"
                  {...profileForm.register("lastName")}
                  disabled={isLoading}
                />
                {profileForm.formState.errors.lastName && (
                  <span className="text-xs text-red-500">
                    {profileForm.formState.errors.lastName.message}
                  </span>
                )}
              </div>
              <Button disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Profile"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>Update your password</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={passwordForm.handleSubmit(onUpdatePassword)} className="space-y-4">
              <div>
                <Input
                  type="password"
                  placeholder="Current Password"
                  {...passwordForm.register("currentPassword")}
                  disabled={isLoading}
                />
                {passwordForm.formState.errors.currentPassword && (
                  <span className="text-xs text-red-500">
                    {passwordForm.formState.errors.currentPassword.message}
                  </span>
                )}
              </div>
              <div>
                <Input
                  type="password"
                  placeholder="New Password"
                  {...passwordForm.register("newPassword")}
                  disabled={isLoading}
                />
                {passwordForm.formState.errors.newPassword && (
                  <span className="text-xs text-red-500">
                    {passwordForm.formState.errors.newPassword.message}
                  </span>
                )}
              </div>
              <div>
                <Input
                  type="password"
                  placeholder="Confirm New Password"
                  {...passwordForm.register("confirmPassword")}
                  disabled={isLoading}
                />
                {passwordForm.formState.errors.confirmPassword && (
                  <span className="text-xs text-red-500">
                    {passwordForm.formState.errors.confirmPassword.message}
                  </span>
                )}
              </div>
              <Button disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Change Password"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
