import { Box, Breakpoint, Typography } from "@mui/material";
import MenuOutlinedIcon from '@mui/icons-material/MenuOutlined';
import { useState } from "react";
import { _workspaces } from "../config-nav-workspace";
import { navData } from "../config-nav-dashboard";
import { NavDesktop } from "../dashboard/nav";

export default function HeaderLogo() {
    const [open, setOpen] = useState(false);
    const layoutQuery: Breakpoint = 'lg';
    return (
        <Box display="flex" alignItems="center" gap={3}>
            <Typography
                fontSize="23px"
                fontWeight="bold"
                color="#00b0ff"
            >
                RiskDefenderAI
            </Typography>

            <Box border="1px solid black" pt="4px" px="4px" height="fit-content" borderRadius="7px" sx={{ cursor: "pointer" }}>
                <MenuOutlinedIcon fontSize="medium" onClick={() => setOpen(!open)} />
            </Box>

            {open && (
                <NavDesktop
                    data={navData}
                    layoutQuery={layoutQuery}
                    workspaces={_workspaces}
                />
            )}
        </Box>
    );
}