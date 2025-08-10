'use client';
import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useUser } from '@/hooks/use-user';
import type { RepresentativeRequest } from '@/lib/types';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export default function AdminRequestsPage() {
  const { representativeRequests, loading } = useUser();
  const { toast } = useToast();

  const handleRequest = async (
    request: RepresentativeRequest,
    newStatus: 'approved' | 'rejected'
  ) => {
    try {
      const requestRef = doc(db, 'representativeRequests', request.id);

      if (newStatus === 'approved') {
        const clubRef = doc(db, 'clubs', request.clubId);
        await updateDoc(clubRef, { representativeId: request.userId });
      }

      await updateDoc(requestRef, { status: newStatus });

      toast({
        title: 'Request Updated',
        description: `The request from ${request.userName} has been ${newStatus}.`,
      });
    } catch (error) {
      console.error('Error updating request:', error);
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: 'Could not update the request. Please try again.',
      });
    }
  };

  const pendingRequests = representativeRequests.filter(
    (req) => req.status === 'pending'
  );

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Representative Requests</CardTitle>
          <CardDescription>
            Approve or reject requests from students to become club
            representatives.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading requests...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Club</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingRequests.length > 0 ? (
                  pendingRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>{request.userName}</TableCell>
                      <TableCell>{request.clubName}</TableCell>
                      <TableCell>
                        {format(new Date(request.requestDate), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleRequest(request, 'approved')}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRequest(request, 'rejected')}
                        >
                          Reject
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      No pending requests.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
