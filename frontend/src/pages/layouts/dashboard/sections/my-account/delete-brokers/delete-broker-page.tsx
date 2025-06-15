import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  Alert,
  Button,
  Snackbar,
  Typography,
  CardContent,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import DeleteBrokerAccountService from "../../../../../../Services/api-services/dashboard-services/sections-services/my-account-services/delete-broker-accounts.service";

interface SubBrokerAccount {
  _id: string;
  marketTypeId: string;
  brokerId: string;
  brokerName: React.ReactNode;
  brokerKey: string;
  subAccountName: string;
  startDate: string;
  endDate: string;
  proxyServiceId: string;
  status: string;
  pendingDeletion: boolean;
  deleteAt: string | null;
}

interface StatusMessage {
  text: string;
  type: "success" | "error" | "info" | "warning";
}

interface SubBrokerResponse {
  length: number;
  statusCode: number;
  success: boolean;
  message: string;
  data: SubBrokerAccount[];
}

interface DeleteResponse {
  statusCode: number;
  success: boolean;
  message: string;
}

export default function DeleteBrokerAccountPage() {
  const [accounts, setAccounts] = useState<SubBrokerAccount[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<string | null>(null); // Track submitting account ID
  const [responseMessage, setResponseMessage] = useState<StatusMessage | null>(null);
  const [showSnackbar, setShowSnackbar] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const activeResponse = await DeleteBrokerAccountService.getActiveSubBrokerAccount();
        if (activeResponse.statusCode === 200 && activeResponse.success) {
          const activeAccounts = Array.isArray(activeResponse.data) ? activeResponse.data : [];
          if (activeAccounts.length === 0) {
            setResponseMessage({ text: "No accounts found", type: "info" });
            setShowSnackbar(true);
          }
          activeAccounts.sort((a, b) => (a.pendingDeletion === b.pendingDeletion ? 0 : a.pendingDeletion ? -1 : 1));
          setAccounts(activeAccounts);
        } else {
          setResponseMessage({ text: activeResponse.message || "Failed to fetch accounts", type: "error" });
          setShowSnackbar(true);
        }
      } catch (error) {
        console.error("Error fetching accounts:", error);
        setResponseMessage({ text: "Failed to fetch accounts", type: "error" });
        setShowSnackbar(true);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDeleteAccount = async (accountId: string) => {
    if (isSubmitting === accountId) return;
    setIsSubmitting(accountId);

    try {
      const response: DeleteResponse = await DeleteBrokerAccountService.requestDeleteAccount(accountId);
      if (response.statusCode === 200 && response.success) {
        setResponseMessage({ text: "Deletion request submitted successfully. Account will be deleted in 5 days.", type: "success" });
        setShowSnackbar(true);
        const activeResponse = await DeleteBrokerAccountService.getActiveSubBrokerAccount();
        if (activeResponse.statusCode === 200 && activeResponse.success) {
          const activeAccounts = Array.isArray(activeResponse.data) ? activeResponse.data : [];
          activeAccounts.sort((a, b) => (a.pendingDeletion === b.pendingDeletion ? 0 : a.pendingDeletion ? -1 : 1));
          setAccounts(activeAccounts);
        }
      } else {
        setResponseMessage({ text: response.message || "Failed to request deletion", type: "error" });
        setShowSnackbar(true);
      }
    } catch (error) {
      console.error("Error requesting deletion:", error);
      setResponseMessage({ text: "Failed to request deletion", type: "error" });
      setShowSnackbar(true);
    } finally {
      setIsSubmitting(null);
    }
  };

  const handleCancelDelete = async (accountId: string) => {
    if (isSubmitting === accountId) return;
    setIsSubmitting(accountId);

    try {
      const response: DeleteResponse = await DeleteBrokerAccountService.cancelDeleteRequest(accountId);
      if (response.statusCode === 200 && response.success) {
        setResponseMessage({ text: "Deletion request cancelled successfully.", type: "success" });
        setShowSnackbar(true);
        const activeResponse = await DeleteBrokerAccountService.getActiveSubBrokerAccount();
        if (activeResponse.statusCode === 200 && activeResponse.success) {
          const activeAccounts = Array.isArray(activeResponse.data) ? activeResponse.data : [];
          activeAccounts.sort((a, b) => (a.pendingDeletion === b.pendingDeletion ? 0 : a.pendingDeletion ? -1 : 1));
          setAccounts(activeAccounts);
        }
      } else {
        setResponseMessage({ text: response.message || "Failed to cancel deletion", type: "error" });
        setShowSnackbar(true);
      }
    } catch (error) {
      console.error("Error cancelling deletion:", error);
      setResponseMessage({ text: "Failed to cancel deletion", type: "error" });
      setShowSnackbar(true);
    } finally {
      setIsSubmitting(null);
    }
  };

  const handleCloseSnackbar = () => setShowSnackbar(false);

  return (
    <Card sx={{ py: 4, my: 4, width: "100%", maxWidth: 1200, mx: "auto", boxShadow: 4, borderRadius: 4 }}>
      <Box sx={{ mx: 4, mb: 4, display: "flex", gap: 4, flexDirection: "column" }}>
        <Snackbar
          open={showSnackbar}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          sx={{ mt: 10 }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={responseMessage?.type || "info"}
            sx={{ width: "100%", fontSize: "1.1rem", py: 2 }}
          >
            {responseMessage?.text}
          </Alert>
        </Snackbar>

        <Card sx={{ boxShadow: 3, borderRadius: 3, p: 2 }}>
          <CardContent>
            <Typography variant="h4" fontWeight={700} mb={3}>
              Broker Accounts (Total: {accounts.length})
            </Typography>
            {isLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
                <CircularProgress size={32} />
              </Box>
            ) : accounts.length > 0 ? (
              <List
                sx={{
                  maxHeight: 400,
                  overflowY: "auto",
                  mt: 2,
                  p: 2,
                  bgcolor: "",
                  borderRadius: 2,
                }}
              >
                {accounts.map((account) => (
                  <ListItem
                    key={account._id}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      bgcolor: account.pendingDeletion ? "#ffcccb" : "inherit",
                      border: account.pendingDeletion ? "1px solid #d32f2f" : "none",
                      borderRadius: 2,
                      mb: 2,
                      py: 2,
                      px: 3,
                    }}
                  >
                    <ListItemText
                      primary={<Typography variant="h6">{account.subAccountName}</Typography>}
                      secondary={
                        <Typography variant="body1">
                          <strong>Broker:</strong> {account.brokerName} |{" "}
                          <strong>Market:</strong> {account.marketTypeId} |{" "}
                          <strong>Start:</strong>{" "}
                          {new Date(account.startDate).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })} |{" "}
                          <strong>End:</strong>{" "}
                          {new Date(account.endDate).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })} |{" "}
                          <strong>Status:</strong> {account.status}
                          {account.pendingDeletion && account.deleteAt && (
                            <>
                              {" | "}
                              <strong>Delete At:</strong>{" "}
                              {new Date(account.deleteAt).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "numeric",
                                minute: "numeric",
                              })}
                            </>
                          )}
                        </Typography>
                      }
                    />
                    <Box sx={{ display: "flex", gap: 2 }}>
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => handleDeleteAccount(account._id)}
                        disabled={isSubmitting === account._id || account.pendingDeletion}
                        sx={{ fontSize: "1rem", py: 1, px: 2 }}
                      >
                        {isSubmitting === account._id && !account.pendingDeletion ? (
                          <>
                            <CircularProgress size={24} color="inherit" />
                            Processing...
                          </>
                        ) : (
                          "Delete Account"
                        )}
                      </Button>
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={() => handleCancelDelete(account._id)}
                        disabled={isSubmitting === account._id || !account.pendingDeletion}
                        sx={{ fontSize: "1rem", py: 1, px: 2 }}
                      >
                        {isSubmitting === account._id && account.pendingDeletion ? (
                          <>
                            <CircularProgress size={24} color="inherit" />
                            Processing...
                          </>
                        ) : (
                          "Cancel Delete"
                        )}
                      </Button>
                    </Box>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body1" color="text.secondary">
                No accounts available.
              </Typography>
            )}
          </CardContent>
        </Card>
      </Box>
    </Card>
  );
}