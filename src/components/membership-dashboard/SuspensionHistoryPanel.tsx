"use client";

import { useState, useEffect } from "react";
import { Box, Card, Chip, Divider, Typography, CircularProgress } from "@mui/material";
// 这里只保留 ManagedUser，因为 SuspensionRecord 我们现在要用从数据库拿回来的真实类型
import { type ManagedUser } from "./UserManagementTable";

type Props = {
  user: ManagedUser | null;
};

// 定义与我们数据库 AppSuspension 表结构一致的接口
interface RealSuspensionRecord {
  id: string;
  appKey: string;
  reason: string;
  suspendedAt: string;
}

// 颜色样式辅助函数保持不变
function actionColor(action: "suspend" | "lift" | "ban") {
  if (action === "suspend") {
    return { backgroundColor: "#fff4e5", color: "#b26a00", label: "Suspended" };
  }
  if (action === "lift") {
    return { backgroundColor: "#e8f5e9", color: "#2e7d32", label: "Lifted" };
  }
  return { backgroundColor: "#fdecea", color: "#c62828", label: "Banned" };
}

function currentStatusColor(status: ManagedUser["status"]) {
  if (status === "active") {
    return { backgroundColor: "#e8f5e9", color: "#2e7d32" };
  }
  if (status === "suspended") {
    return { backgroundColor: "#fff4e5", color: "#b26a00" };
  }
  return { backgroundColor: "#fdecea", color: "#c62828" };
}

export default function SuspensionHistoryPanel({ user }: Props) {
  // 👇 1. 新增状态管理：用于存放真实数据和加载状态
  const [history, setHistory] = useState<RealSuspensionRecord[]>([]);
  const [loading, setLoading] = useState(false);

  // 👇 2. 新增副作用钩子：当选中的 user 发生变化时，去后端拿数据
  useEffect(() => {
    if (!user?.id) {
      setHistory([]);
      return;
    }

    const fetchHistory = async () => {
      setLoading(true);
      try {
        // 调用我们刚刚建好的专门查案底的 API
        const res = await fetch(`/api/admin/suspension-history?userId=${user.id}`);
        if (res.ok) {
          const data = await res.json();
          setHistory(data);
        }
      } catch (error) {
        console.error("Failed to fetch suspension history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user?.id]);

  // 如果没有选中用户，显示空提示（原逻辑保持不变）
  if (!user) {
    return (
      <Card sx={{ borderRadius: "8px", border: "1px solid #e7e9ee", boxShadow: "none", p: 2 }}>
        <Typography sx={{ fontWeight: 600, color: "#111827" }}>Suspension history</Typography>
        <Typography sx={{ mt: 1, fontSize: 14, color: "#6b7280" }}>
          Select a user from the table to view suspension history and audit records.
        </Typography>
      </Card>
    );
  }

  return (
    <Card sx={{ borderRadius: "8px", border: "1px solid #e7e9ee", boxShadow: "none", overflow: "hidden" }}>
      <Box sx={{ px: 2, py: 1.6, borderBottom: "1px solid #eceef2" }}>
        <Typography sx={{ fontSize: 17, fontWeight: 600, color: "#111827" }}>
          Suspension history
        </Typography>
        <Typography sx={{ fontSize: 14, color: "#6b7280", mt: 0.5 }}>
          Audit trail is retained even when access is restored.
        </Typography>
      </Box>

      <Box sx={{ p: 2 }}>
        {/* 用户基本信息卡片 */}
        <Box sx={{ p: 1.5, borderRadius: "10px", border: "1px solid #e5e7eb", backgroundColor: "#f9fafb", mb: 2 }}>
          <Typography sx={{ fontSize: 16, fontWeight: 600, color: "#111827" }}>
            {user.name}
          </Typography>
          <Typography sx={{ fontSize: 14, color: "#6b7280", mt: 0.5 }}>
            {user.userType} · {user.email}
          </Typography>

          <Box sx={{ mt: 1.25, display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Chip
              label={user.status}
              size="small"
              sx={{ ...currentStatusColor(user.status), textTransform: "capitalize", fontWeight: 600 }}
            />
            <Chip
              label={user.appScope}
              size="small"
              sx={{ backgroundColor: "#eef4ff", color: "#0b63d7", fontWeight: 600 }}
            />
          </Box>
        </Box>

        {/* 👇 3. 数据渲染逻辑：加载中 -> 没记录 -> 有记录 */}
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
            <CircularProgress size={24} />
          </Box>
        ) : history.length === 0 ? (
          <Box sx={{ p: 2, borderRadius: "10px", border: "1px dashed #d1d5db", backgroundColor: "#fff" }}>
            <Typography sx={{ fontSize: 15, fontWeight: 600, color: "#374151" }}>
              No history yet
            </Typography>
            <Typography sx={{ fontSize: 14, color: "#6b7280", mt: 0.5 }}>
              This user has a clean record. No suspensions found in the database.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: "grid", gap: 1.25 }}>
            {/* 👇 4. 遍历并渲染从数据库拿回来的真数据 */}
            {history.map((record, index) => {
              // 统一渲染为 suspend 样式，因为数据来源于 AppSuspension 表
              const styles = actionColor("suspend"); 

              return (
                <Box key={record.id} sx={{ p: 1.5, borderRadius: "10px", border: "1px solid #e5e7eb", backgroundColor: "#fff" }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1.5, alignItems: "flex-start", flexWrap: "wrap" }}>
                    <Box>
                      <Chip
                        label={styles.label}
                        size="small"
                        sx={{ backgroundColor: styles.backgroundColor, color: styles.color, fontWeight: 600, mb: 1 }}
                      />
                      <Typography sx={{ fontSize: 15, fontWeight: 600, color: "#111827" }}>
                        {record.appKey /* 使用数据库里的 appKey */}
                      </Typography>
                      <Typography sx={{ fontSize: 13, color: "#6b7280", mt: 0.4 }}>
                        Logged at {new Date(record.suspendedAt).toLocaleDateString()}
                      </Typography>
                    </Box>

                    <Typography sx={{ fontSize: 13, color: "#6b7280" }}>
                      Record {history.length - index}
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 1.25 }} />

                  <Box sx={{ display: "grid", gap: 0.75 }}>
                    <Typography sx={{ fontSize: 14, color: "#374151" }}>
                      <strong>Reason:</strong> {record.reason || "Violation of platform terms"}
                    </Typography>

                    <Typography sx={{ fontSize: 14, color: "#374151" }}>
                      <strong>Suspended at:</strong> {new Date(record.suspendedAt).toLocaleString()}
                    </Typography>
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}
      </Box>
    </Card>
  );
}