"use client";

import { AxiosError } from 'axios';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { userApi, UserResponse } from '@/lib/user-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Navigation } from '@/components/navigation';
import { toast } from 'sonner';
import { Trash2, Edit2, X, Check, Copy, Crown } from 'lucide-react';

export default function UsersPage() {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [newEmail, setNewEmail] = useState('');
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editEmail, setEditEmail] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userApi.getAllUsers();
      setUsers(data);
    } catch (error: unknown) {
      toast.error('Failed to fetch users');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const createUser = async () => {
    if (!newEmail) {
      toast.error('Please enter an email');
      return;
    }

    try {
      const user = await userApi.createUser({ email: newEmail });
      setUsers([...users, user]);
      setNewEmail('');
      toast.success('User created successfully');
    } catch (error: unknown) {
      const message = getErrorMessage(error, 'Failed to create user');
      toast.error(message);
    }
  };

  const updateUser = async (userId: string) => {
    if (!editEmail) {
      toast.error('Please enter an email');
      return;
    }

    try {
      const updatedUser = await userApi.updateUser(userId, { email: editEmail });
      setUsers(users.map(u => u.id === userId ? updatedUser : u));
      setEditingUser(null);
      setEditEmail('');
      toast.success('User updated successfully');
    } catch (error: unknown) {
      const message = getErrorMessage(error, 'Failed to update user');
      toast.error(message);
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      await userApi.deleteUser(userId);
      setUsers(users.filter(u => u.id !== userId));
      toast.success('User deleted successfully');
    } catch (error: unknown) {
      const message = getErrorMessage(error, 'Failed to delete user');
      toast.error(message);
    }
  };

  const copyUserId = async (userId: string) => {
    try {
      await navigator.clipboard.writeText(userId);
      toast.success('User ID copied');
    } catch (error) {
      console.error('Failed to copy user ID:', error);
      toast.error('Failed to copy user ID');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold mb-6">Users Management</h1>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Create New User</CardTitle>
              <CardDescription>Add a new user to the system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Enter email address"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && createUser()}
                />
                <Button onClick={createUser}>Create User</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>All Users</CardTitle>
              <CardDescription>Manage existing users and use these IDs for subscription operations</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p>Loading users...</p>
              ) : users.length === 0 ? (
                <p className="text-muted-foreground">No users found</p>
              ) : (
                <div className="space-y-3">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className="rounded-lg border bg-white p-4"
                    >
                      {editingUser === user.id ? (
                        <div className="flex items-center justify-between gap-3">
                          <Input
                            type="email"
                            value={editEmail}
                            onChange={(e) => setEditEmail(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && updateUser(user.id)}
                            className="mr-2"
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => updateUser(user.id)}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingUser(null);
                                setEditEmail('');
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                          <div className="space-y-1">
                            <p className="font-medium">{user.email}</p>
                            <p className="text-sm text-muted-foreground">
                              User ID: <span className="font-mono">{user.id}</span>
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Created: {new Date(user.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => copyUserId(user.id)}
                            >
                              <Copy className="mr-2 h-4 w-4" />
                              Copy ID
                            </Button>
                            <Button
                              asChild
                              size="sm"
                              variant="outline"
                            >
                              <Link href={`/subscriptions?userId=${encodeURIComponent(user.id)}`}>
                                <Crown className="mr-2 h-4 w-4" />
                                Open in Subscriptions
                              </Link>
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingUser(user.id);
                                setEditEmail(user.email);
                              }}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => deleteUser(user.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof AxiosError) {
    return error.response?.data?.message || fallback;
  }

  return fallback;
}
