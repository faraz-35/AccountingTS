import { createSupabaseServerClient } from "@/common/lib/supabase-server";
import { Button } from "@/common/components/ui";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/common/components/ui";
import { Badge } from "@/common/components/ui/badge";
import { UserInviteDialog } from "./components/user-invite-dialog";
import { UserPlus, Shield, Users } from "lucide-react";

export default async function UsersPage() {
  const supabase = await createSupabaseServerClient();

  try {
    // Fetch organization members with user details
    const { data: members } = await supabase
      .from("organization_members")
      .select(
        `
        *,
        user:users (
          id,
          email,
          created_at
        )
      `,
      )
      .order("created_at", { ascending: false });

    // Calculate stats
    const adminCount = members?.filter((m) => m.role === "admin").length || 0;
    const memberCount = members?.length || 0;

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Users</h1>
            <p className="text-gray-600 mt-1">
              Manage your organization members
            </p>
          </div>
          <UserInviteDialog />
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-8 w-8 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold">{memberCount}</div>
                  <div className="text-sm text-gray-500">Total Users</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Shield className="h-8 w-8 text-green-600" />
                <div>
                  <div className="text-2xl font-bold">{adminCount}</div>
                  <div className="text-sm text-gray-500">Administrators</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <UserPlus className="h-8 w-8 text-purple-600" />
                <div>
                  <div className="text-2xl font-bold">
                    {memberCount - adminCount}
                  </div>
                  <div className="text-sm text-gray-500">Regular Members</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Organization Members</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {members?.map((member) => (
                    <tr key={member.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-600">
                              {(member.user?.email || "")
                                .charAt(0)
                                .toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {member.user?.email?.split("@")[0] || "Unknown"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {member.user?.email || "No email"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge
                          variant={
                            member.role === "admin" ? "default" : "secondary"
                          }
                          className={
                            member.role === "admin"
                              ? "bg-green-100 text-green-800"
                              : ""
                          }
                        >
                          {member.role === "admin" ? (
                            <>
                              <Shield className="h-3 w-3 mr-1" />
                              Admin
                            </>
                          ) : (
                            "Member"
                          )}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {member.user?.created_at
                          ? new Date(
                              member.user.created_at,
                            ).toLocaleDateString()
                          : "Unknown"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            // TODO: Implement role change functionality
                          >
                            Change Role
                          </Button>
                          {/* Remove button would go here but omitting for safety */}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Empty State */}
        {!members ||
          (members.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Users className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No users in your organization yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Invite team members to collaborate on your accounting system.
                </p>
                <UserInviteDialog />
              </CardContent>
            </Card>
          ))}
      </div>
    );
  } catch (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Users</h1>
            <p className="text-gray-600 mt-1">
              Manage your organization members
            </p>
          </div>
        </div>
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="h-16 w-16 mx-auto text-red-600 mb-4" />
            <h3 className="text-lg font-semibold text-red-900 mb-2">
              Error loading users
            </h3>
            <p className="text-red-600">
              {error instanceof Error
                ? error.message
                : "Unknown error occurred"}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
}
