"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { User, Settings, Download, Trash2, Lock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";

interface UserProfile {
    name: string | null;
    email: string;
}

interface UserPreferences {
    defaultWeightUnit: string;
    defaultWaterUnit: string;
}

export default function SettingsPage() {
    const [profile, setProfile] = useState<UserProfile>({
        name: "",
        email: "",
    });
    const [preferences, setPreferences] = useState<UserPreferences>({
        defaultWeightUnit: "kg",
        defaultWaterUnit: "ml",
    });
    const [isLoadingProfile, setIsLoadingProfile] = useState(false);
    const [isLoadingPreferences, setIsLoadingPreferences] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [hasPassword, setHasPassword] = useState(true); // Assume true until we check
    const [passwords, setPasswords] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
        revokeOtherSessions: false,
    });

    useEffect(() => {
        fetchProfile();
        fetchPreferences();
        checkHasPassword();
    }, []);

    const checkHasPassword = async () => {
        try {
            const response = await fetch("/api/user/has-password");
            if (response.ok) {
                const data = await response.json();
                setHasPassword(data.hasPassword);
            }
        } catch (error) {
            console.error("Error checking password status:", error);
            // Default to true to avoid hiding the section unnecessarily
            setHasPassword(true);
        }
    };

    const fetchProfile = async () => {
        setIsLoadingProfile(true);
        try {
            const response = await fetch("/api/user/profile");
            if (response.ok) {
                const data = await response.json();
                setProfile(data);
            }
        } catch (error) {
            console.error("Error fetching profile:", error);
            toast.error("Failed to load profile");
        } finally {
            setIsLoadingProfile(false);
        }
    };

    const fetchPreferences = async () => {
        setIsLoadingPreferences(true);
        try {
            const response = await fetch("/api/user/preferences");
            if (response.ok) {
                const data = await response.json();
                setPreferences(data);
            }
        } catch (error) {
            console.error("Error fetching preferences:", error);
        } finally {
            setIsLoadingPreferences(false);
        }
    };

    const updateProfile = async () => {
        setIsSaving(true);
        try {
            const response = await fetch("/api/user/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(profile),
            });

            if (response.ok) {
                toast.success("Profile updated successfully");
            } else {
                throw new Error("Failed to update profile");
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error("Failed to update profile");
        } finally {
            setIsSaving(false);
        }
    };

    const updatePreferences = async () => {
        setIsSaving(true);
        try {
            const response = await fetch("/api/user/preferences", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(preferences),
            });

            if (response.ok) {
                toast.success("Preferences saved successfully");
            } else {
                throw new Error("Failed to update preferences");
            }
        } catch (error) {
            console.error("Error updating preferences:", error);
            toast.error("Failed to save preferences");
        } finally {
            setIsSaving(false);
        }
    };

    const changePassword = async () => {
        if (passwords.newPassword !== passwords.confirmPassword) {
            toast.error("New passwords do not match");
            return;
        }

        if (passwords.newPassword.length < 8) {
            toast.error("Password must be at least 8 characters");
            return;
        }

        setIsSaving(true);
        try {
            const response = await fetch("/api/user/change-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    currentPassword: passwords.currentPassword,
                    newPassword: passwords.newPassword,
                    revokeOtherSessions: passwords.revokeOtherSessions,
                }),
            });

            if (response.ok) {
                toast.success("Password changed successfully");
                setPasswords({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                    revokeOtherSessions: false,
                });
            } else {
                const error = await response.json();
                toast.error(error.error || "Failed to change password");
            }
        } catch (error) {
            console.error("Error changing password:", error);
            toast.error("Failed to change password");
        } finally {
            setIsSaving(false);
        }
    };

    const exportData = async () => {
        try {
            const response = await fetch("/api/user/export");
            if (response.ok) {
                const blob = await response.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `fitness-data-export-${new Date().toISOString().split("T")[0]}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                toast.success("Data exported successfully");
            } else {
                throw new Error("Failed to export data");
            }
        } catch (error) {
            console.error("Error exporting data:", error);
            toast.error("Failed to export data");
        }
    };

    const deleteAccount = async () => {
        try {
            const response = await fetch("/api/user/account", {
                method: "DELETE",
            });

            if (response.ok) {
                toast.success("Account deleted successfully");
                window.location.href = "/";
            } else {
                throw new Error("Failed to delete account");
            }
        } catch (error) {
            console.error("Error deleting account:", error);
            toast.error("Failed to delete account");
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">
                    Manage your account settings and preferences
                </p>
            </div>

            <Tabs defaultValue="profile" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="profile" className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Profile
                    </TabsTrigger>
                    <TabsTrigger value="preferences" className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        Preferences
                    </TabsTrigger>
                    <TabsTrigger value="security" className="flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        Security
                    </TabsTrigger>
                </TabsList>

                {/* Profile Tab */}
                <TabsContent value="profile" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile Information</CardTitle>
                            <CardDescription>Update your personal information</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {isLoadingProfile ?
                                <div className="flex h-full items-center justify-center">
                                    <Loader2 className="h-8 w-8 animate-spin" />
                                </div>
                                :
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Name</Label>
                                        <Input
                                            id="name"
                                            value={profile.name || ""}
                                            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                            placeholder="Your name"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={profile.email}
                                            disabled
                                            className="bg-muted"
                                        />
                                        <p className="text-sm text-muted-foreground">Email cannot be changed</p>
                                    </div>

                                    <Button onClick={updateProfile} disabled={isSaving}>
                                        {isSaving ? "Saving..." : "Save Changes"}
                                    </Button>
                                </>
                            }
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Data Management</CardTitle>
                            <CardDescription>Export or delete your data</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">Export Data</p>
                                    <p className="text-sm text-muted-foreground">
                                        Download all your fitness data as JSON
                                    </p>
                                </div>
                                <Button onClick={exportData} variant="outline">
                                    <Download className="mr-2 h-4 w-4" />
                                    Export
                                </Button>
                            </div>

                            <Separator />

                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-destructive">Delete Account</p>
                                    <p className="text-sm text-muted-foreground">
                                        Permanently delete your account and all data
                                    </p>
                                </div>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive">
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Delete
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action cannot be undone. This will permanently delete your
                                                account and remove all your data from our servers.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={deleteAccount} className="bg-destructive">
                                                Delete Account
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Preferences Tab */}
                <TabsContent value="preferences">
                    <Card>
                        <CardHeader>
                            <CardTitle>Default Units</CardTitle>
                            <CardDescription>
                                Set your preferred units for measurements
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {isLoadingPreferences ?
                                <div className="flex h-full items-center justify-center">
                                    <Loader2 className="h-8 w-8 animate-spin" />
                                </div>
                                :
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="weight-unit">Weight Unit</Label>
                                        <Select
                                            value={preferences.defaultWeightUnit}
                                            onValueChange={(value) =>
                                                setPreferences({ ...preferences, defaultWeightUnit: value })
                                            }
                                        >
                                            <SelectTrigger id="weight-unit">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="kg">Kilograms (kg)</SelectItem>
                                                <SelectItem value="lbs">Pounds (lbs)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="water-unit">Water Unit</Label>
                                        <Select
                                            value={preferences.defaultWaterUnit}
                                            onValueChange={(value) =>
                                                setPreferences({ ...preferences, defaultWaterUnit: value })
                                            }
                                        >
                                            <SelectTrigger id="water-unit">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="ml">Milliliters (ml)</SelectItem>
                                                <SelectItem value="oz">Ounces (oz)</SelectItem>
                                                <SelectItem value="cups">Cups</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <Button onClick={updatePreferences} disabled={isSaving}>
                                        {isSaving ? "Saving..." : "Save Preferences"}
                                    </Button>
                                </>
                            }
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Security Tab */}
                <TabsContent value="security">
                    {hasPassword ? (
                        <Card>
                            <CardHeader>
                                <CardTitle>Change Password</CardTitle>
                                <CardDescription>
                                    Update your password to keep your account secure
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="current-password">Current Password</Label>
                                    <Input
                                        id="current-password"
                                        type="password"
                                        value={passwords.currentPassword}
                                        onChange={(e) =>
                                            setPasswords({ ...passwords, currentPassword: e.target.value })
                                        }
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="new-password">New Password</Label>
                                    <Input
                                        id="new-password"
                                        type="password"
                                        value={passwords.newPassword}
                                        onChange={(e) =>
                                            setPasswords({ ...passwords, newPassword: e.target.value })
                                        }
                                    />
                                    <p className="text-sm text-muted-foreground">
                                        Minimum 8 characters
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                                    <Input
                                        id="confirm-password"
                                        type="password"
                                        value={passwords.confirmPassword}
                                        onChange={(e) =>
                                            setPasswords({ ...passwords, confirmPassword: e.target.value })
                                        }
                                    />
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="revoke-sessions"
                                        checked={passwords.revokeOtherSessions}
                                        onCheckedChange={(checked) =>
                                            setPasswords({ ...passwords, revokeOtherSessions: checked as boolean })
                                        }
                                    />
                                    <label
                                        htmlFor="revoke-sessions"
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        Sign out of all other devices
                                    </label>
                                </div>

                                <Button onClick={changePassword} disabled={isSaving}>
                                    {isSaving ? "Changing..." : "Change Password"}
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card>
                            <CardHeader>
                                <CardTitle>Password Not Available</CardTitle>
                                <CardDescription>
                                    You signed in using a social login provider
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="rounded-lg border bg-muted p-4">
                                    <p className="text-sm text-muted-foreground">
                                        Your account is connected through a third-party authentication provider
                                        (such as Google). Password management is handled by that provider.
                                    </p>
                                    <p className="text-sm text-muted-foreground mt-2">
                                        To change your password, please visit your authentication provider&apos;s
                                        account settings.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}