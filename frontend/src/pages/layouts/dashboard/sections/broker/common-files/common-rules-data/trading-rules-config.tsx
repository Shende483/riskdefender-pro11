export interface Rule {
  name: string;
  description: string;
  key: string;
  type: 'boolean' | 'number' | 'time' | 'timerange' | 'enum';
  options?: string[];
  marketType: 'cryptocurrency' | 'forex' | 'stockmarket';
  tradingType: 'cash' | 'future' | 'option';
  defaultValue: any;
  constraints: {
    max?: number;
    maxTime?: string;
    maxDurationHours?: number;
  };
}

export interface RuleValue {
  key: string;
  value: any;
  error?: string;
}

export interface TradingRules {
  cash: RuleValue[];
  future: RuleValue[];
  option: RuleValue[];
}

export const rules: Rule[] = [
  // Cryptocurrency - Cash
  { name: "Auto Place SL And Target Price", description: "Automatically reapply previous day's stop-loss and target prices at market open", key: "ccAutoPlaceSLAndTargetPrice", type: "boolean", marketType: "cryptocurrency", tradingType: "cash", defaultValue: true, constraints: {} },
  { name: "Auto Close Position On Market Reverse", description: "Automatically close position when market moves against your position by a set threshold", key: "ccAutoClosePositionOnMarketReverse", type: "boolean", marketType: "cryptocurrency", tradingType: "cash", defaultValue: true, constraints: {} },
  { name: "Max Entries In Specific Symbol", description: "Maximum entries allowed per symbol", key: "ccMaxEntriesInSpecificSymbol", type: "number", marketType: "cryptocurrency", tradingType: "cash", defaultValue: 3, constraints: { max: 30 } },
  { name: "Entry Side", description: "Choose which direction entries are allowed", key: "ccEntrySide", type: "enum", options: ["Buy", "Sell", "Both"], marketType: "cryptocurrency", tradingType: "cash", defaultValue: "Both", constraints: {} },
  { name: "Max Pending Entry In Specific Symbol", description: "Maximum pending entries allowed per symbol", key: "ccMaxPendingEntryInSpecificSymbol", type: "number", marketType: "cryptocurrency", tradingType: "cash", defaultValue: 3, constraints: { max: 10 } },
  { name: "Margin Types", description: "Select allowed margin type(s) for trading", key: "ccMarginTypes", type: "enum", options: ["Isolated", "Cross"], marketType: "cryptocurrency", tradingType: "cash", defaultValue: "Isolated", constraints: {} },
  { name: "Max Entry Per Day", description: "Maximum number of trades allowed per day", key: "ccMaxEntryPerDay", type: "number", marketType: "cryptocurrency", tradingType: "cash", defaultValue: 5, constraints: { max: 100 } },
  { name: "Entry Type", description: "Select allowed order types for entries", key: "ccEntryType", type: "enum", options: ["Market", "Limit", "Stop"], marketType: "cryptocurrency", tradingType: "cash", defaultValue: "Market", constraints: {} },
  { name: "Max Pending Order", description: "Maximum number of pending orders allowed", key: "ccMaxPendingOrder", type: "number", marketType: "cryptocurrency", tradingType: "cash", defaultValue: 4, constraints: { max: 50 } },
  { name: "Consecutive Entry Duration", description: "Minimum waiting period required between trades to prevent overtrading", key: "ccConsecutiveEntryDuration", type: "time", marketType: "cryptocurrency", tradingType: "cash", defaultValue: "10:00:00", constraints: { maxTime: "17:00:00" } },
  { name: "Max Risk Entry", description: "Maximum risk allowed per trade (in %)", key: "ccMaxRiskEntry", type: "number", marketType: "cryptocurrency", tradingType: "cash", defaultValue: 2, constraints: { max: 20 } },
  { name: "SL And TP Trailing Duration", description: "Disable SL & TP changes for this duration after any modification", key: "ccSLAndTPTrailingDuration", type: "time", marketType: "cryptocurrency", tradingType: "cash", defaultValue: "00:20:00", constraints: { maxDurationHours: 8760 } }, // 12 months
  { name: "Max Leverage", description: "Set the maximum leverage allowed", key: "ccMaxLeverage", type: "number", marketType: "cryptocurrency", tradingType: "cash", defaultValue: 10, constraints: { max: 20 } },
  { name: "Position Min Hold Duration", description: "Minimum time to hold a position before it can be closed", key: "ccPositionMinHoldDuration", type: "time", marketType: "cryptocurrency", tradingType: "cash", defaultValue: "24:00:00", constraints: { maxDurationHours: 43800 } }, // 5 years
  { name: "Entry Block Period", description: "Block trade entries during this time range", key: "ccEntryBlockPeriod", type: "timerange", marketType: "cryptocurrency", tradingType: "cash", defaultValue: { start: "12:00", end: "13:00" }, constraints: { maxDurationHours: 24 } },
  { name: "Pending Entry Block Period", description: "Block editing pending orders during this time range", key: "ccPendingOrderModifyBlockPeriod", type: "timerange", marketType: "cryptocurrency", tradingType: "cash", defaultValue: { start: "12:00", end: "16:00" }, constraints: { maxDurationHours: 24 } },

  // Cryptocurrency - Future
  { name: "Auto Place SL And Target Price", description: "Automatically reapply previous day's stop-loss and target prices at market open", key: "cfAutoPlaceSLAndTargetPrice", type: "boolean", marketType: "cryptocurrency", tradingType: "future", defaultValue: true, constraints: {} },
  { name: "Auto Close Position On Market Reverse", description: "Automatically close position when market moves against your position by a set threshold", key: "cfAutoClosePositionOnMarketReverse", type: "boolean", marketType: "cryptocurrency", tradingType: "future", defaultValue: true, constraints: {} },
  { name: "Max Entries In Specific Symbol", description: "Maximum entries allowed per symbol", key: "cfMaxEntriesInSpecificSymbol", type: "number", marketType: "cryptocurrency", tradingType: "future", defaultValue: 3, constraints: { max: 30 } },
  { name: "Entry Side", description: "Choose which direction entries are allowed", key: "cfEntrySide", type: "enum", options: ["Buy", "Sell", "Both"], marketType: "cryptocurrency", tradingType: "future", defaultValue: "Both", constraints: {} },
  { name: "Max Pending Entry In Specific Symbol", description: "Maximum pending entries allowed per symbol", key: "cfMaxPendingEntryInSpecificSymbol", type: "number", marketType: "cryptocurrency", tradingType: "future", defaultValue: 3, constraints: { max: 10 } },
  { name: "Margin Types", description: "Select allowed margin type(s) for trading", key: "cfMarginTypes", type: "enum", options: ["Isolated", "Cross"], marketType: "cryptocurrency", tradingType: "future", defaultValue: "Isolated", constraints: {} },
  { name: "Max Entry Per Day", description: "Maximum number of trades allowed per day", key: "cfMaxEntryPerDay", type: "number", marketType: "cryptocurrency", tradingType: "future", defaultValue: 5, constraints: { max: 100 } },
  { name: "Entry Type", description: "Select allowed order types for entries", key: "cfEntryType", type: "enum", options: ["Market", "Limit", "Stop"], marketType: "cryptocurrency", tradingType: "future", defaultValue: "Market", constraints: {} },
  { name: "Max Pending Order", description: "Maximum number of pending orders allowed", key: "cfMaxPendingOrder", type: "number", marketType: "cryptocurrency", tradingType: "future", defaultValue: 4, constraints: { max: 50 } },
  { name: "Consecutive Entry Duration", description: "Minimum waiting period required between trades to prevent overtrading", key: "cfConsecutiveEntryDuration", type: "time", marketType: "cryptocurrency", tradingType: "future", defaultValue: "10:00:00", constraints: { maxTime: "17:00:00" } },
  { name: "Max Risk Entry", description: "Maximum risk allowed per trade (in %)", key: "cfMaxRiskEntry", type: "number", marketType: "cryptocurrency", tradingType: "future", defaultValue: 2, constraints: { max: 20 } },
  { name: "SL And TP Trailing Duration", description: "Disable SL & TP changes for this duration after any modification", key: "cfSLAndTPTrailingDuration", type: "time", marketType: "cryptocurrency", tradingType: "future", defaultValue: "00:20:00", constraints: { maxDurationHours: 8760 } },
  { name: "Max Leverage", description: "Set the maximum leverage allowed", key: "cfMaxLeverage", type: "number", marketType: "cryptocurrency", tradingType: "future", defaultValue: 10, constraints: { max: 20 } },
  { name: "Position Min Hold Duration", description: "Minimum time to hold a position before it can be closed", key: "cfPositionMinHoldDuration", type: "time", marketType: "cryptocurrency", tradingType: "future", defaultValue: "24:00:00", constraints: { maxDurationHours: 43800 } },
  { name: "Entry Block Period", description: "Block trade entries during this time range", key: "cfEntryBlockPeriod", type: "timerange", marketType: "cryptocurrency", tradingType: "future", defaultValue: { start: "12:00", end: "13:00" }, constraints: { maxDurationHours: 24 } },
  { name: "Pending Entry Block Period", description: "Block editing pending orders during this time range", key: "cfPendingOrderModifyBlockPeriod", type: "timerange", marketType: "cryptocurrency", tradingType: "future", defaultValue: { start: "12:00", end: "16:00" }, constraints: { maxDurationHours: 24 } },

  // Cryptocurrency - Option
  { name: "Auto Place SL And Target Price", description: "Automatically reapply previous day's stop-loss and target prices at market open", key: "coAutoPlaceSLAndTargetPrice", type: "boolean", marketType: "cryptocurrency", tradingType: "option", defaultValue: true, constraints: {} },
  { name: "Auto Close Position On Market Reverse", description: "Automatically close position when market moves against your position by a set threshold", key: "coAutoClosePositionOnMarketReverse", type: "boolean", marketType: "cryptocurrency", tradingType: "option", defaultValue: true, constraints: {} },
  { name: "Max Entries In Specific Symbol", description: "Maximum entries allowed per symbol", key: "coMaxEntriesInSpecificSymbol", type: "number", marketType: "cryptocurrency", tradingType: "option", defaultValue: 3, constraints: { max: 30 } },
  { name: "Entry Side", description: "Choose which direction entries are allowed", key: "coEntrySide", type: "enum", options: ["Buy", "Sell", "Both"], marketType: "cryptocurrency", tradingType: "option", defaultValue: "Both", constraints: {} },
  { name: "Max Pending Entry In Specific Symbol", description: "Maximum pending entries allowed per symbol", key: "coMaxPendingEntryInSpecificSymbol", type: "number", marketType: "cryptocurrency", tradingType: "option", defaultValue: 3, constraints: { max: 10 } },
  { name: "Margin Types", description: "Select allowed margin type(s) for trading", key: "coMarginTypes", type: "enum", options: ["Isolated", "Cross"], marketType: "cryptocurrency", tradingType: "option", defaultValue: "Isolated", constraints: {} },
  { name: "Max Entry Per Day", description: "Maximum number of trades allowed per day", key: "coMaxEntryPerDay", type: "number", marketType: "cryptocurrency", tradingType: "option", defaultValue: 5, constraints: { max: 100 } },
  { name: "Entry Type", description: "Select allowed order types for entries", key: "coEntryType", type: "enum", options: ["Market", "Limit"], marketType: "cryptocurrency", tradingType: "option", defaultValue: "Market", constraints: {} },
  { name: "Max Pending Order", description: "Maximum number of pending orders allowed", key: "coMaxPendingOrder", type: "number", marketType: "cryptocurrency", tradingType: "option", defaultValue: 4, constraints: { max: 50 } },
  { name: "Consecutive Entry Duration", description: "Minimum waiting period required between trades to prevent overtrading", key: "coConsecutiveEntryDuration", type: "time", marketType: "cryptocurrency", tradingType: "option", defaultValue: "10:00:00", constraints: { maxTime: "17:00:00" } },
  { name: "Max Risk Entry", description: "Maximum risk allowed per trade (in %)", key: "coMaxRiskEntry", type: "number", marketType: "cryptocurrency", tradingType: "option", defaultValue: 2, constraints: { max: 20 } },
  { name: "SL And TP Trailing Duration", description: "Disable SL & TP changes for this duration after any modification", key: "coSLAndTPTrailingDuration", type: "time", marketType: "cryptocurrency", tradingType: "option", defaultValue: "00:20:00", constraints: { maxDurationHours: 8760 } },
  { name: "Max Leverage", description: "Set the maximum leverage allowed", key: "coMaxLeverage", type: "number", marketType: "cryptocurrency", tradingType: "option", defaultValue: 10, constraints: { max: 20 } },
  { name: "Position Min Hold Duration", description: "Minimum time to hold a position before it can be closed", key: "coPositionMinHoldDuration", type: "time", marketType: "cryptocurrency", tradingType: "option", defaultValue: "24:00:00", constraints: { maxDurationHours: 43800 } },
  { name: "Entry Block Period", description: "Block trade entries during this time range", key: "coEntryBlockPeriod", type: "timerange", marketType: "cryptocurrency", tradingType: "option", defaultValue: { start: "12:00", end: "13:00" }, constraints: { maxDurationHours: 24 } },
  { name: "Pending Entry Block Period", description: "Block editing pending orders during this time range", key: "coPendingOrderModifyBlockPeriod", type: "timerange", marketType: "cryptocurrency", tradingType: "option", defaultValue: { start: "12:00", end: "16:00" }, constraints: { maxDurationHours: 24 } },

  // Forex - Cash
  { name: "Auto Place SL And Target Price", description: "Automatically reapply previous day's stop-loss and target prices at market open", key: "fcAutoPlaceSLAndTargetPrice", type: "boolean", marketType: "forex", tradingType: "cash", defaultValue: true, constraints: {} },
  { name: "Auto Close Position On Market Reverse", description: "Automatically close position when market moves against your position by a set threshold", key: "fcAutoClosePositionOnMarketReverse", type: "boolean", marketType: "forex", tradingType: "cash", defaultValue: true, constraints: {} },
  { name: "Max Entries In Specific Symbol", description: "Maximum entries allowed per symbol", key: "fcMaxEntriesInSpecificSymbol", type: "number", marketType: "forex", tradingType: "cash", defaultValue: 3, constraints: { max: 30 } },
  { name: "Entry Side", description: "Choose which direction entries are allowed", key: "fcEntrySide", type: "enum", options: ["Buy", "Sell", "Both"], marketType: "forex", tradingType: "cash", defaultValue: "Both", constraints: {} },
  { name: "Max Pending Entry In Specific Symbol", description: "Maximum pending entries allowed per symbol", key: "fcMaxPendingEntryInSpecificSymbol", type: "number", marketType: "forex", tradingType: "cash", defaultValue: 3, constraints: { max: 10 } },
  { name: "Margin Types", description: "Select allowed margin type(s) for trading", key: "fcMarginTypes", type: "enum", options: ["Isolated", "Cross", "None"], marketType: "forex", tradingType: "cash", defaultValue: "Isolated", constraints: {} },
  { name: "Max Entry Per Day", description: "Maximum number of trades allowed per day", key: "fcMaxEntryPerDay", type: "number", marketType: "forex", tradingType: "cash", defaultValue: 5, constraints: { max: 100 } },
  { name: "Entry Type", description: "Select allowed order types for entries", key: "fcEntryType", type: "enum", options: ["Market", "Limit", "Stop"], marketType: "forex", tradingType: "cash", defaultValue: "Market", constraints: {} },
  { name: "Max Pending Order", description: "Maximum number of pending orders allowed", key: "fcMaxPendingOrder", type: "number", marketType: "forex", tradingType: "cash", defaultValue: 4, constraints: { max: 50 } },
  { name: "Consecutive Entry Duration", description: "Minimum waiting period required between trades to prevent overtrading", key: "fcConsecutiveEntryDuration", type: "time", marketType: "forex", tradingType: "cash", defaultValue: "10:00:00", constraints: { maxTime: "17:00:00" } },
  { name: "Max Risk Entry", description: "Maximum risk allowed per trade (in %)", key: "fcMaxRiskEntry", type: "number", marketType: "forex", tradingType: "cash", defaultValue: 2, constraints: { max: 20 } },
  { name: "SL And TP Trailing Duration", description: "Disable SL & TP changes for this duration after any modification", key: "fcSLAndTPTrailingDuration", type: "time", marketType: "forex", tradingType: "cash", defaultValue: "00:20:00", constraints: { maxDurationHours: 8760 } },
  { name: "Max Leverage", description: "Set the maximum leverage allowed", key: "fcMaxLeverage", type: "number", marketType: "forex", tradingType: "cash", defaultValue: 10, constraints: { max: 20 } },
  { name: "Position Min Hold Duration", description: "Minimum time to hold a position before it can be closed", key: "fcPositionMinHoldDuration", type: "time", marketType: "forex", tradingType: "cash", defaultValue: "24:00:00", constraints: { maxDurationHours: 43800 } },
  { name: "Entry Block Period", description: "Block trade entries during this time range", key: "fcEntryBlockPeriod", type: "timerange", marketType: "forex", tradingType: "cash", defaultValue: { start: "12:00", end: "13:00" }, constraints: { maxDurationHours: 24 } },
  { name: "Pending Entry Block Period", description: "Block editing pending orders during this time range", key: "fcPendingOrderModifyBlockPeriod", type: "timerange", marketType: "forex", tradingType: "cash", defaultValue: { start: "12:00", end: "16:00" }, constraints: { maxDurationHours: 24 } },

  // Forex - Future
  { name: "Auto Place SL And Target Price", description: "Automatically reapply previous day's stop-loss and target prices at market open", key: "ffAutoPlaceSLAndTargetPrice", type: "boolean", marketType: "forex", tradingType: "future", defaultValue: true, constraints: {} },
  { name: "Auto Close Position On Market Reverse", description: "Automatically close position when market moves against your position by a set threshold", key: "ffAutoClosePositionOnMarketReverse", type: "boolean", marketType: "forex", tradingType: "future", defaultValue: true, constraints: {} },
  { name: "Max Entries In Specific Symbol", description: "Maximum entries allowed per symbol", key: "ffMaxEntriesInSpecificSymbol", type: "number", marketType: "forex", tradingType: "future", defaultValue: 3, constraints: { max: 30 } },
  { name: "Entry Side", description: "Choose which direction entries are allowed", key: "ffEntrySide", type: "enum", options: ["Buy", "Sell", "Both"], marketType: "forex", tradingType: "future", defaultValue: "Both", constraints: {} },
  { name: "Max Pending Entry In Specific Symbol", description: "Maximum pending entries allowed per symbol", key: "ffMaxPendingEntryInSpecificSymbol", type: "number", marketType: "forex", tradingType: "future", defaultValue: 3, constraints: { max: 10 } },
  { name: "Margin Types", description: "Select allowed margin type(s) for trading", key: "ffMarginTypes", type: "enum", options: ["Isolated", "Cross"], marketType: "forex", tradingType: "future", defaultValue: "Isolated", constraints: {} },
  { name: "Max Entry Per Day", description: "Maximum number of trades allowed per day", key: "ffMaxEntryPerDay", type: "number", marketType: "forex", tradingType: "future", defaultValue: 5, constraints: { max: 100 } },
  { name: "Entry Type", description: "Select allowed order types for entries", key: "ffEntryType", type: "enum", options: ["Market", "Limit", "Stop"], marketType: "forex", tradingType: "future", defaultValue: "Market", constraints: {} },
  { name: "Max Pending Order", description: "Maximum number of pending orders allowed", key: "ffMaxPendingOrder", type: "number", marketType: "forex", tradingType: "future", defaultValue: 4, constraints: { max: 50 } },
  { name: "Consecutive Entry Duration", description: "Minimum waiting period required between trades to prevent overtrading", key: "ffConsecutiveEntryDuration", type: "time", marketType: "forex", tradingType: "future", defaultValue: "10:00:00", constraints: { maxTime: "17:00:00" } },
  { name: "Max Risk Entry", description: "Maximum risk allowed per trade (in %)", key: "ffMaxRiskEntry", type: "number", marketType: "forex", tradingType: "future", defaultValue: 2, constraints: { max: 20 } },
  { name: "SL And TP Trailing Duration", description: "Disable SL & TP changes for this duration after any modification", key: "ffSLAndTPTrailingDuration", type: "time", marketType: "forex", tradingType: "future", defaultValue: "00:20:00", constraints: { maxDurationHours: 8760 } },
  { name: "Max Leverage", description: "Set the maximum leverage allowed", key: "ffMaxLeverage", type: "number", marketType: "forex", tradingType: "future", defaultValue: 10, constraints: { max: 20 } },
  { name: "Position Min Hold Duration", description: "Minimum time to hold a position before it can be closed", key: "ffPositionMinHoldDuration", type: "time", marketType: "forex", tradingType: "future", defaultValue: "24:00:00", constraints: { maxDurationHours: 43800 } },
  { name: "Entry Block Period", description: "Block trade entries during this time range", key: "ffEntryBlockPeriod", type: "timerange", marketType: "forex", tradingType: "future", defaultValue: { start: "12:00", end: "13:00" }, constraints: { maxDurationHours: 24 } },
  { name: "Pending Entry Block Period", description: "Block editing pending orders during this time range", key: "ffPendingOrderModifyBlockPeriod", type: "timerange", marketType: "forex", tradingType: "future", defaultValue: { start: "12:00", end: "16:00" }, constraints: { maxDurationHours: 24 } },

  // Forex - Option
  { name: "Auto Place SL And Target Price", description: "Automatically reapply previous day's stop-loss and target prices at market open", key: "foAutoPlaceSLAndTargetPrice", type: "boolean", marketType: "forex", tradingType: "option", defaultValue: true, constraints: {} },
  { name: "Auto Close Position On Market Reverse", description: "Automatically close position when market moves against your position by a set threshold", key: "foAutoClosePositionOnMarketReverse", type: "boolean", marketType: "forex", tradingType: "option", defaultValue: true, constraints: {} },
  { name: "Max Entries In Specific Symbol", description: "Maximum entries allowed per symbol", key: "foMaxEntriesInSpecificSymbol", type: "number", marketType: "forex", tradingType: "option", defaultValue: 3, constraints: { max: 30 } },
  { name: "Entry Side", description: "Choose which direction entries are allowed", key: "foEntrySide", type: "enum", options: ["Buy", "Sell", "Both"], marketType: "forex", tradingType: "option", defaultValue: "Both", constraints: {} },
  { name: "Max Pending Entry In Specific Symbol", description: "Maximum pending entries allowed per symbol", key: "foMaxPendingEntryInSpecificSymbol", type: "number", marketType: "forex", tradingType: "option", defaultValue: 3, constraints: { max: 10 } },
  { name: "Margin Types", description: "Select allowed margin type(s) for trading", key: "foMarginTypes", type: "enum", options: ["Isolated", "Cross"], marketType: "forex", tradingType: "option", defaultValue: "Isolated", constraints: {} },
  { name: "Max Entry Per Day", description: "Maximum number of trades allowed per day", key: "foMaxEntryPerDay", type: "number", marketType: "forex", tradingType: "option", defaultValue: 5, constraints: { max: 100 } },
  { name: "Entry Type", description: "Select allowed order types for entries", key: "foEntryType", type: "enum", options: ["Market", "Limit"], marketType: "forex", tradingType: "option", defaultValue: "Market", constraints: {} },
  { name: "Max Pending Order", description: "Maximum number of pending orders allowed", key: "foMaxPendingOrder", type: "number", marketType: "forex", tradingType: "option", defaultValue: 4, constraints: { max: 50 } },
  { name: "Consecutive Entry Duration", description: "Minimum waiting period required between trades to prevent overtrading", key: "foConsecutiveEntryDuration", type: "time", marketType: "forex", tradingType: "option", defaultValue: "10:00:00", constraints: { maxTime: "17:00:00" } },
  { name: "Max Risk Entry", description: "Maximum risk allowed per trade (in %)", key: "foMaxRiskEntry", type: "number", marketType: "forex", tradingType: "option", defaultValue: 2, constraints: { max: 20 } },
  { name: "SL And TP Trailing Duration", description: "Disable SL & TP changes for this duration after any modification", key: "foSLAndTPTrailingDuration", type: "time", marketType: "forex", tradingType: "option", defaultValue: "00:20:00", constraints: { maxDurationHours: 8760 } },
  { name: "Max Leverage", description: "Set the maximum leverage allowed", key: "foMaxLeverage", type: "number", marketType: "forex", tradingType: "option", defaultValue: 10, constraints: { max: 20 } },
  { name: "Position Min Hold Duration", description: "Minimum time to hold a position before it can be closed", key: "foPositionMinHoldDuration", type: "time", marketType: "forex", tradingType: "option", defaultValue: "24:00:00", constraints: { maxDurationHours: 43800 } },
  { name: "Entry Block Period", description: "Block trade entries during this time range", key: "foEntryBlockPeriod", type: "timerange", marketType: "forex", tradingType: "option", defaultValue: { start: "12:00", end: "13:00" }, constraints: { maxDurationHours: 24 } },
  { name: "Pending Entry Block Period", description: "Block editing pending orders during this time range", key: "foPendingOrderModifyBlockPeriod", type: "timerange", marketType: "forex", tradingType: "option", defaultValue: { start: "12:00", end: "16:00" }, constraints: { maxDurationHours: 24 } },

  // Stock Market - Cash
  { name: "Auto Place SL And Target Price", description: "Automatically reapply previous day's stop-loss and target prices at market open", key: "scAutoPlaceSLAndTargetPrice", type: "boolean", marketType: "stockmarket", tradingType: "cash", defaultValue: true, constraints: {} },
  { name: "Auto Close Position On Market Reverse", description: "Automatically close position when market moves against your position by a set threshold", key: "scAutoClosePositionOnMarketReverse", type: "boolean", marketType: "stockmarket", tradingType: "cash", defaultValue: true, constraints: {} },
  { name: "Max Entries In Specific Symbol", description: "Maximum entries allowed per symbol", key: "scMaxEntriesInSpecificSymbol", type: "number", marketType: "stockmarket", tradingType: "cash", defaultValue: 3, constraints: { max: 30 } },
  { name: "Entry Side", description: "Choose which direction entries are allowed", key: "scEntrySide", type: "enum", options: ["Buy", "Sell"], marketType: "stockmarket", tradingType: "cash", defaultValue: "Buy", constraints: {} },
  { name: "Max Pending Entry In Specific Symbol", description: "Maximum pending entries allowed per symbol", key: "scMaxPendingEntryInSpecificSymbol", type: "number", marketType: "stockmarket", tradingType: "cash", defaultValue: 3, constraints: { max: 10 } },
  { name: "Margin Types", description: "Select allowed margin type(s) for trading", key: "scMarginTypes", type: "enum", options: ["Isolated", "Cross", "None"], marketType: "stockmarket", tradingType: "cash", defaultValue: "Isolated", constraints: {} },
  { name: "Max Entry Per Day", description: "Maximum number of trades allowed per day", key: "scMaxEntryPerDay", type: "number", marketType: "stockmarket", tradingType: "cash", defaultValue: 5, constraints: { max: 100 } },
  { name: "Entry Type", description: "Select allowed order types for entries", key: "scEntryType", type: "enum", options: ["Market", "Limit", "Stop"], marketType: "stockmarket", tradingType: "cash", defaultValue: "Market", constraints: {} },
  { name: "Max Pending Order", description: "Maximum number of pending orders allowed", key: "scMaxPendingOrder", type: "number", marketType: "stockmarket", tradingType: "cash", defaultValue: 4, constraints: { max: 50 } },
  { name: "Consecutive Entry Duration", description: "Minimum waiting period required between trades to prevent overtrading", key: "scConsecutiveEntryDuration", type: "time", marketType: "stockmarket", tradingType: "cash", defaultValue: "10:00:00", constraints: { maxTime: "17:00:00" } },
  { name: "Max Risk Entry", description: "Maximum risk allowed per trade (in %)", key: "scMaxRiskEntry", type: "number", marketType: "stockmarket", tradingType: "cash", defaultValue: 2, constraints: { max: 20 } },
  { name: "SL And TP Trailing Duration", description: "Disable SL & TP changes for this duration after any modification", key: "scSLAndTPTrailingDuration", type: "time", marketType: "stockmarket", tradingType: "cash", defaultValue: "00:20:00", constraints: { maxDurationHours: 8760 } },
  { name: "Max Leverage", description: "Set the maximum leverage allowed", key: "scMaxLeverage", type: "number", marketType: "stockmarket", tradingType: "cash", defaultValue: 10, constraints: { max: 20 } },
  { name: "Position Min Hold Duration", description: "Minimum time to hold a position before it can be closed", key: "scPositionMinHoldDuration", type: "time", marketType: "stockmarket", tradingType: "cash", defaultValue: "24:00:00", constraints: { maxDurationHours: 43800 } },
  { name: "Entry Block Period", description: "Block trade entries during this time range", key: "scEntryBlockPeriod", type: "timerange", marketType: "stockmarket", tradingType: "cash", defaultValue: { start: "12:00", end: "13:00" }, constraints: { maxDurationHours: 24 } },
  { name: "Pending Entry Block Period", description: "Block editing pending orders during this time range", key: "scPendingOrderModifyBlockPeriod", type: "timerange", marketType: "stockmarket", tradingType: "cash", defaultValue: { start: "12:00", end: "16:00" }, constraints: { maxDurationHours: 24 } },

  // Stock Market - Future
  { name: "Auto Place SL And Target Price", description: "Automatically reapply previous day's stop-loss and target prices at market open", key: "sfAutoPlaceSLAndTargetPrice", type: "boolean", marketType: "stockmarket", tradingType: "future", defaultValue: true, constraints: {} },
  { name: "Auto Close Position On Market Reverse", description: "Automatically close position when market moves against your position by a set threshold", key: "sfAutoClosePositionOnMarketReverse", type: "boolean", marketType: "stockmarket", tradingType: "future", defaultValue: true, constraints: {} },
  { name: "Max Entries In Specific Symbol", description: "Maximum entries allowed per symbol", key: "sfMaxEntriesInSpecificSymbol", type: "number", marketType: "stockmarket", tradingType: "future", defaultValue: 3, constraints: { max: 30 } },
  { name: "Entry Side", description: "Choose which direction entries are allowed", key: "sfEntrySide", type: "enum", options: ["Buy", "Sell"], marketType: "stockmarket", tradingType: "future", defaultValue: "Buy", constraints: {} },
  { name: "Max Pending Entry In Specific Symbol", description: "Maximum pending entries allowed per symbol", key: "sfMaxPendingEntryInSpecificSymbol", type: "number", marketType: "stockmarket", tradingType: "future", defaultValue: 3, constraints: { max: 10 } },
  { name: "Margin Types", description: "Select allowed margin type(s) for trading", key: "sfMarginTypes", type: "enum", options: ["Isolated", "Cross"], marketType: "stockmarket", tradingType: "future", defaultValue: "Isolated", constraints: {} },
  { name: "Max Entry Per Day", description: "Maximum number of trades allowed per day", key: "sfMaxEntryPerDay", type: "number", marketType: "stockmarket", tradingType: "future", defaultValue: 5, constraints: { max: 100 } },
  { name: "Entry Type", description: "Select allowed order types for entries", key: "sfEntryType", type: "enum", options: ["Market", "Limit", "Stop"], marketType: "stockmarket", tradingType: "future", defaultValue: "Market", constraints: {} },
  { name: "Max Pending Order", description: "Maximum number of pending orders allowed", key: "sfMaxPendingOrder", type: "number", marketType: "stockmarket", tradingType: "future", defaultValue: 4, constraints: { max: 50 } },
  { name: "Consecutive Entry Duration", description: "Minimum waiting period required between trades to prevent overtrading", key: "sfConsecutiveEntryDuration", type: "time", marketType: "stockmarket", tradingType: "future", defaultValue: "10:00:00", constraints: { maxTime: "17:00:00" } },
  { name: "Max Risk Entry", description: "Maximum risk allowed per trade (in %)", key: "sfMaxRiskEntry", type: "number", marketType: "stockmarket", tradingType: "future", defaultValue: 2, constraints: { max: 20 } },
  { name: "SL And TP Trailing Duration", description: "Disable SL & TP changes for this duration after any modification", key: "sfSLAndTPTrailingDuration", type: "time", marketType: "stockmarket", tradingType: "future", defaultValue: "00:20:00", constraints: { maxDurationHours: 8760 } },
  { name: "Max Leverage", description: "Set the maximum leverage allowed", key: "sfMaxLeverage", type: "number", marketType: "stockmarket", tradingType: "future", defaultValue: 10, constraints: { max: 20 } },
  { name: "Position Min Hold Duration", description: "Minimum time to hold a position before it can be closed", key: "sfPositionMinHoldDuration", type: "time", marketType: "stockmarket", tradingType: "future", defaultValue: "24:00:00", constraints: { maxDurationHours: 43800 } },
  { name: "Entry Block Period", description: "Block trade entries during this time range", key: "sfEntryBlockPeriod", type: "timerange", marketType: "stockmarket", tradingType: "future", defaultValue: { start: "12:00", end: "13:00" }, constraints: { maxDurationHours: 24 } },
  { name: "Pending Entry Block Period", description: "Block editing pending orders during this time range", key: "sfPendingOrderModifyBlockPeriod", type: "timerange", marketType: "stockmarket", tradingType: "future", defaultValue: { start: "12:00", end: "16:00" }, constraints: { maxDurationHours: 24 } },

  // Stock Market - Option
  { name: "Auto Place SL And Target Price", description: "Automatically reapply previous day's stop-loss and target prices at market open", key: "soAutoPlaceSLAndTargetPrice", type: "boolean", marketType: "stockmarket", tradingType: "option", defaultValue: true, constraints: {} },
  { name: "Auto Close Position On Market Reverse", description: "Automatically close position when market moves against your position by a set threshold", key: "soAutoClosePositionOnMarketReverse", type: "boolean", marketType: "stockmarket", tradingType: "option", defaultValue: true, constraints: {} },
  { name: "Max Entries In Specific Symbol", description: "Maximum entries allowed per symbol", key: "soMaxEntriesInSpecificSymbol", type: "number", marketType: "stockmarket", tradingType: "option", defaultValue: 3, constraints: { max: 30 } },
  { name: "Entry Side", description: "Choose which direction entries are allowed", key: "soEntrySide", type: "enum", options: ["Buy", "Sell"], marketType: "stockmarket", tradingType: "option", defaultValue: "Buy", constraints: {} },
  { name: "Max Pending Entry In Specific Symbol", description: "Maximum pending entries allowed per symbol", key: "soMaxPendingEntryInSpecificSymbol", type: "number", marketType: "stockmarket", tradingType: "option", defaultValue: 3, constraints: { max: 10 } },
  { name: "Margin Types", description: "Select allowed margin type(s) for trading", key: "soMarginTypes", type: "enum", options: ["Isolated", "Cross"], marketType: "stockmarket", tradingType: "option", defaultValue: "Isolated", constraints: {} },
  { name: "Max Entry Per Day", description: "Maximum number of trades allowed per day", key: "soMaxEntryPerDay", type: "number", marketType: "stockmarket", tradingType: "option", defaultValue: 5, constraints: { max: 100 } },
  { name: "Entry Type", description: "Select allowed order types for entries", key: "soEntryType", type: "enum", options: ["Market", "Limit"], marketType: "stockmarket", tradingType: "option", defaultValue: "Market", constraints: {} },
  { name: "Max Pending Order", description: "Maximum number of pending orders allowed", key: "soMaxPendingOrder", type: "number", marketType: "stockmarket", tradingType: "option", defaultValue: 4, constraints: { max: 50 } },
  { name: "Consecutive Entry Duration", description: "Minimum waiting period required between trades to prevent overtrading", key: "soConsecutiveEntryDuration", type: "time", marketType: "stockmarket", tradingType: "option", defaultValue: "10:00:00", constraints: { maxTime: "17:00:00" } },
  { name: "Max Risk Entry", description: "Maximum risk allowed per trade (in %)", key: "soMaxRiskEntry", type: "number", marketType: "stockmarket", tradingType: "option", defaultValue: 2, constraints: { max: 20 } },
  { name: "SL And TP Trailing Duration", description: "Disable SL & TP changes for this duration after any modification", key: "soSLAndTPTrailingDuration", type: "time", marketType: "stockmarket", tradingType: "option", defaultValue: "00:20:00", constraints: { maxDurationHours: 8760 } },
  { name: "Max Leverage", description: "Set the maximum leverage allowed", key: "soMaxLeverage", type: "number", marketType: "stockmarket", tradingType: "option", defaultValue: 10, constraints: { max: 20 } },
  { name: "Position Min Hold Duration", description: "Minimum time to hold a position before it can be closed", key: "soPositionMinHoldDuration", type: "time", marketType: "stockmarket", tradingType: "option", defaultValue: "24:00:00", constraints: { maxDurationHours: 43800 } },
  { name: "Entry Block Period", description: "Block trade entries during this time range", key: "soEntryBlockPeriod", type: "timerange", marketType: "stockmarket", tradingType: "option", defaultValue: { start: "12:00", end: "13:00" }, constraints: { maxDurationHours: 24 } },
  { name: "Pending Entry Block Period", description: "Block editing pending orders during this time range", key: "soPendingOrderModifyBlockPeriod", type: "timerange", marketType: "stockmarket", tradingType: "option", defaultValue: { start: "12:00", end: "16:00" }, constraints: { maxDurationHours: 24 } },
];


/*
export interface Rule {
  name: string;
  description: string;
  key: string;
  type: 'boolean' | 'number' | 'time' | 'timerange' | 'enum';
  options?: string[];
  marketType: 'cryptocurrency' | 'forex' | 'stockmarket';
  tradingType: 'cash' | 'future' | 'option';
}

export interface RuleValue {
  key: string;
  value: any;
  error?: string;
}

export interface TradingRules {
  cash: RuleValue[];
  future: RuleValue[];
  option: RuleValue[];
}

export const rules: Rule[] = [
  // Cryptocurrency - Cash (16 rules)
  { name: "Auto Place SL And Target Price", description: "Automatically reapply previous day's stop-loss and target prices at market open", key: "ccAutoPlaceSLAndTargetPrice", type: "boolean", marketType: "cryptocurrency", tradingType: "cash" },
  { name: "Auto Close Position On Market Reverse", description: "Automatically close position when market moves against your position by a set threshold", key: "ccAutoClosePositionOnMarketReverse", type: "boolean", marketType: "cryptocurrency", tradingType: "cash" },
  { name: "Max Entries In Specific Symbol", description: "Maximum entries allowed per symbol", key: "ccMaxEntriesInSpecificSymbol", type: "number", marketType: "cryptocurrency", tradingType: "cash" },
  { name: "Entry Side", description: "Choose which direction entries are allowed", key: "ccEntrySide", type: "enum", options: ["Buy", "Sell", "Both"], marketType: "cryptocurrency", tradingType: "cash" },
  { name: "Max Pending Entry In Specific Symbol", description: "Maximum pending entries allowed per symbol", key: "ccMaxPendingEntryInSpecificSymbol", type: "number", marketType: "cryptocurrency", tradingType: "cash" },
  { name: "Margin Types", description: "Select allowed margin type(s) for trading", key: "ccMarginTypes", type: "enum", options: ["Isolated", "Cross", "None"], marketType: "cryptocurrency", tradingType: "cash" },
  { name: "Max Entry Per Day", description: "Maximum number of trades allowed per day", key: "ccMaxEntryPerDay", type: "number", marketType: "cryptocurrency", tradingType: "cash" },
  { name: "Entry Type", description: "Select allowed order types for entries", key: "ccEntryType", type: "enum", options: ["Market", "Limit", "Stop"], marketType: "cryptocurrency", tradingType: "cash" },
  { name: "Max Pending Order", description: "Maximum number of pending orders allowed", key: "ccMaxPendingOrder", type: "number", marketType: "cryptocurrency", tradingType: "cash" },
  { name: "Consecutive Entry Duration", description: "Minimum waiting period required between trades to prevent overtrading", key: "ccConsecutiveEntryDuration", type: "time", marketType: "cryptocurrency", tradingType: "cash" },
  { name: "Max Risk Entry", description: "Maximum risk allowed per trade (in %)", key: "ccMaxRiskEntry", type: "number", marketType: "cryptocurrency", tradingType: "cash" },
  { name: "SL And TP Trailing Duration", description: "Disable SL & TP changes for this duration after any modification", key: "ccSLAndTPTrailingDuration", type: "time", marketType: "cryptocurrency", tradingType: "cash" },
  { name: "Max Leverage", description: "Set the maximum leverage allowed", key: "ccMaxLeverage", type: "number", marketType: "cryptocurrency", tradingType: "cash" },
  { name: "Position Min Hold Duration", description: "Minimum time to hold a position before it can be closed", key: "ccPositionMinHoldDuration", type: "time", marketType: "cryptocurrency", tradingType: "cash" },
  { name: "Entry Block Period", description: "Block trade entries during this time range", key: "ccEntryBlockPeriod", type: "timerange", marketType: "cryptocurrency", tradingType: "cash" },
  { name: "Pending Entry Block Period", description: "Block editing pending orders during this time range", key: "ccPendingOrderModifyBlockPeriod", type: "timerange", marketType: "cryptocurrency", tradingType: "cash" },

  // Cryptocurrency - Future (16 rules)
  { name: "Auto Place SL And Target Price", description: "Automatically reapply previous day's stop-loss and target prices at market open", key: "cfAutoPlaceSLAndTargetPrice", type: "boolean", marketType: "cryptocurrency", tradingType: "future" },
  { name: "Auto Close Position On Market Reverse", description: "Automatically close position when market moves against your position by a set threshold", key: "cfAutoClosePositionOnMarketReverse", type: "boolean", marketType: "cryptocurrency", tradingType: "future" },
  { name: "Max Entries In Specific Symbol", description: "Maximum entries allowed per symbol", key: "cfMaxEntriesInSpecificSymbol", type: "number", marketType: "cryptocurrency", tradingType: "future" },
  { name: "Entry Side", description: "Choose which direction entries are allowed", key: "cfEntrySide", type: "enum", options: ["Buy", "Sell", "Both"], marketType: "cryptocurrency", tradingType: "future" },
  { name: "Max Pending Entry In Specific Symbol", description: "Maximum pending entries allowed per symbol", key: "cfMaxPendingEntryInSpecificSymbol", type: "number", marketType: "cryptocurrency", tradingType: "future" },
  { name: "Margin Types", description: "Select allowed margin type(s) for trading", key: "cfMarginTypes", type: "enum", options: ["Isolated", "Cross"], marketType: "cryptocurrency", tradingType: "future" },
  { name: "Max Entry Per Day", description: "Maximum number of trades allowed per day", key: "cfMaxEntryPerDay", type: "number", marketType: "cryptocurrency", tradingType: "future" },
  { name: "Entry Type", description: "Select allowed order types for entries", key: "cfEntryType", type: "enum", options: ["Market", "Limit", "Stop"], marketType: "cryptocurrency", tradingType: "future" },
  { name: "Max Pending Order", description: "Maximum number of pending orders allowed", key: "cfMaxPendingOrder", type: "number", marketType: "cryptocurrency", tradingType: "future" },
  { name: "Consecutive Entry Duration", description: "Minimum waiting period required between trades to prevent overtrading", key: "cfConsecutiveEntryDuration", type: "time", marketType: "cryptocurrency", tradingType: "future" },
  { name: "Max Risk Entry", description: "Maximum risk allowed per trade (in %)", key: "cfMaxRiskEntry", type: "number", marketType: "cryptocurrency", tradingType: "future" },
  { name: "SL And TP Trailing Duration", description: "Disable SL & TP changes for this duration after any modification", key: "cfSLAndTPTrailingDuration", type: "time", marketType: "cryptocurrency", tradingType: "future" },
  { name: "Max Leverage", description: "Set the maximum leverage allowed", key: "cfMaxLeverage", type: "number", marketType: "cryptocurrency", tradingType: "future" },
  { name: "Position Min Hold Duration", description: "Minimum time to hold a position before it can be closed", key: "cfPositionMinHoldDuration", type: "time", marketType: "cryptocurrency", tradingType: "future" },
  { name: "Entry Block Period", description: "Block trade entries during this time range", key: "cfEntryBlockPeriod", type: "timerange", marketType: "cryptocurrency", tradingType: "future" },
  { name: "Pending Entry Block Period", description: "Block editing pending orders during this time range", key: "cfPendingOrderModifyBlockPeriod", type: "timerange", marketType: "cryptocurrency", tradingType: "future" },

  // Cryptocurrency - Option (16 rules)
  { name: "Auto Place SL And Target Price", description: "Automatically reapply previous day's stop-loss and target prices at market open", key: "coAutoPlaceSLAndTargetPrice", type: "boolean", marketType: "cryptocurrency", tradingType: "option" },
  { name: "Auto Close Position On Market Reverse", description: "Automatically close position when market moves against your position by a set threshold", key: "coAutoClosePositionOnMarketReverse", type: "boolean", marketType: "cryptocurrency", tradingType: "option" },
  { name: "Max Entries In Specific Symbol", description: "Maximum entries allowed per symbol", key: "coMaxEntriesInSpecificSymbol", type: "number", marketType: "cryptocurrency", tradingType: "option" },
  { name: "Entry Side", description: "Choose which direction entries are allowed", key: "coEntrySide", type: "enum", options: ["Buy", "Sell", "Both"], marketType: "cryptocurrency", tradingType: "option" },
  { name: "Max Pending Entry In Specific Symbol", description: "Maximum pending entries allowed per symbol", key: "coMaxPendingEntryInSpecificSymbol", type: "number", marketType: "cryptocurrency", tradingType: "option" },
  { name: "Margin Types", description: "Select allowed margin type(s) for trading", key: "coMarginTypes", type: "enum", options: ["Isolated", "Cross"], marketType: "cryptocurrency", tradingType: "option" },
  { name: "Max Entry Per Day", description: "Maximum number of trades allowed per day", key: "coMaxEntryPerDay", type: "number", marketType: "cryptocurrency", tradingType: "option" },
  { name: "Entry Type", description: "Select allowed order types for entries", key: "coEntryType", type: "enum", options: ["Market", "Limit"], marketType: "cryptocurrency", tradingType: "option" },
  { name: "Max Pending Order", description: "Maximum number of pending orders allowed", key: "coMaxPendingOrder", type: "number", marketType: "cryptocurrency", tradingType: "option" },
  { name: "Consecutive Entry Duration", description: "Minimum waiting period required between trades to prevent overtrading", key: "coConsecutiveEntryDuration", type: "time", marketType: "cryptocurrency", tradingType: "option" },
  { name: "Max Risk Entry", description: "Maximum risk allowed per trade (in %)", key: "coMaxRiskEntry", type: "number", marketType: "cryptocurrency", tradingType: "option" },
  { name: "SL And TP Trailing Duration", description: "Disable SL & TP changes for this duration after any modification", key: "coSLAndTPTrailingDuration", type: "time", marketType: "cryptocurrency", tradingType: "option" },
  { name: "Max Leverage", description: "Set the maximum leverage allowed", key: "coMaxLeverage", type: "number", marketType: "cryptocurrency", tradingType: "option" },
  { name: "Position Min Hold Duration", description: "Minimum time to hold a position before it can be closed", key: "coPositionMinHoldDuration", type: "time", marketType: "cryptocurrency", tradingType: "option" },
  { name: "Entry Block Period", description: "Block trade entries during this time range", key: "coEntryBlockPeriod", type: "timerange", marketType: "cryptocurrency", tradingType: "option" },
  { name: "Pending Entry Block Period", description: "Block editing pending orders during this time range", key: "coPendingOrderModifyBlockPeriod", type: "timerange", marketType: "cryptocurrency", tradingType: "option" },

  // Forex - Cash (16 rules)
  { name: "Auto Place SL And Target Price", description: "Automatically reapply previous day's stop-loss and target prices at market open", key: "fcAutoPlaceSLAndTargetPrice", type: "boolean", marketType: "forex", tradingType: "cash" },
  { name: "Auto Close Position On Market Reverse", description: "Automatically close position when market moves against your position by a set threshold", key: "fcAutoClosePositionOnMarketReverse", type: "boolean", marketType: "forex", tradingType: "cash" },
  { name: "Max Entries In Specific Symbol", description: "Maximum entries allowed per symbol", key: "fcMaxEntriesInSpecificSymbol", type: "number", marketType: "forex", tradingType: "cash" },
  { name: "Entry Side", description: "Choose which direction entries are allowed", key: "fcEntrySide", type: "enum", options: ["Buy", "Sell", "Both"], marketType: "forex", tradingType: "cash" },
  { name: "Max Pending Entry In Specific Symbol", description: "Maximum pending entries allowed per symbol", key: "fcMaxPendingEntryInSpecificSymbol", type: "number", marketType: "forex", tradingType: "cash" },
  { name: "Margin Types", description: "Select allowed margin type(s) for trading", key: "fcMarginTypes", type: "enum", options: ["Isolated", "Cross", "None"], marketType: "forex", tradingType: "cash" },
  { name: "Max Entry Per Day", description: "Maximum number of trades allowed per day", key: "fcMaxEntryPerDay", type: "number", marketType: "forex", tradingType: "cash" },
  { name: "Entry Type", description: "Select allowed order types for entries", key: "fcEntryType", type: "enum", options: ["Market", "Limit", "Stop"], marketType: "forex", tradingType: "cash" },
  { name: "Max Pending Order", description: "Maximum number of pending orders allowed", key: "fcMaxPendingOrder", type: "number", marketType: "forex", tradingType: "cash" },
  { name: "Consecutive Entry Duration", description: "Minimum waiting period required between trades to prevent overtrading", key: "fcConsecutiveEntryDuration", type: "time", marketType: "forex", tradingType: "cash" },
  { name: "Max Risk Entry", description: "Maximum risk allowed per trade (in %)", key: "fcMaxRiskEntry", type: "number", marketType: "forex", tradingType: "cash" },
  { name: "SL And TP Trailing Duration", description: "Disable SL & TP changes for this duration after any modification", key: "fcSLAndTPTrailingDuration", type: "time", marketType: "forex", tradingType: "cash" },
  { name: "Max Leverage", description: "Set the maximum leverage allowed", key: "fcMaxLeverage", type: "number", marketType: "forex", tradingType: "cash" },
  { name: "Position Min Hold Duration", description: "Minimum time to hold a position before it can be closed", key: "fcPositionMinHoldDuration", type: "time", marketType: "forex", tradingType: "cash" },
  { name: "Entry Block Period", description: "Block trade entries during this time range", key: "fcEntryBlockPeriod", type: "timerange", marketType: "forex", tradingType: "cash" },
  { name: "Pending Entry Block Period", description: "Block editing pending orders during this time range", key: "fcPendingOrderModifyBlockPeriod", type: "timerange", marketType: "forex", tradingType: "cash" },

  // Forex - Future (16 rules)
  { name: "Auto Place SL And Target Price", description: "Automatically reapply previous day's stop-loss and target prices at market open", key: "ffAutoPlaceSLAndTargetPrice", type: "boolean", marketType: "forex", tradingType: "future" },
  { name: "Auto Close Position On Market Reverse", description: "Automatically close position when market moves against your position by a set threshold", key: "ffAutoClosePositionOnMarketReverse", type: "boolean", marketType: "forex", tradingType: "future" },
  { name: "Max Entries In Specific Symbol", description: "Maximum entries allowed per symbol", key: "ffMaxEntriesInSpecificSymbol", type: "number", marketType: "forex", tradingType: "future" },
  { name: "Entry Side", description: "Choose which direction entries are allowed", key: "ffEntrySide", type: "enum", options: ["Buy", "Sell", "Both"], marketType: "forex", tradingType: "future" },
  { name: "Max Pending Entry In Specific Symbol", description: "Maximum pending entries allowed per symbol", key: "ffMaxPendingEntryInSpecificSymbol", type: "number", marketType: "forex", tradingType: "future" },
  { name: "Margin Types", description: "Select allowed margin type(s) for trading", key: "ffMarginTypes", type: "enum", options: ["Isolated", "Cross"], marketType: "forex", tradingType: "future" },
  { name: "Max Entry Per Day", description: "Maximum number of trades allowed per day", key: "ffMaxEntryPerDay", type: "number", marketType: "forex", tradingType: "future" },
  { name: "Entry Type", description: "Select allowed order types for entries", key: "ffEntryType", type: "enum", options: ["Market", "Limit", "Stop"], marketType: "forex", tradingType: "future" },
  { name: "Max Pending Order", description: "Maximum number of pending orders allowed", key: "ffMaxPendingOrder", type: "number", marketType: "forex", tradingType: "future" },
  { name: "Consecutive Entry Duration", description: "Minimum waiting period required between trades to prevent overtrading", key: "ffConsecutiveEntryDuration", type: "time", marketType: "forex", tradingType: "future" },
  { name: "Max Risk Entry", description: "Maximum risk allowed per trade (in %)", key: "ffMaxRiskEntry", type: "number", marketType: "forex", tradingType: "future" },
  { name: "SL And TP Trailing Duration", description: "Disable SL & TP changes for this duration after any modification", key: "ffSLAndTPTrailingDuration", type: "time", marketType: "forex", tradingType: "future" },
  { name: "Max Leverage", description: "Set the maximum leverage allowed", key: "ffMaxLeverage", type: "number", marketType: "forex", tradingType: "future" },
  { name: "Position Min Hold Duration", description: "Minimum time to hold a position before it can be closed", key: "ffPositionMinHoldDuration", type: "time", marketType: "forex", tradingType: "future" },
  { name: "Entry Block Period", description: "Block trade entries during this time range", key: "ffEntryBlockPeriod", type: "timerange", marketType: "forex", tradingType: "future" },
  { name: "Pending Entry Block Period", description: "Block editing pending orders during this time range", key: "ffPendingOrderModifyBlockPeriod", type: "timerange", marketType: "forex", tradingType: "future" },

  // Forex - Option (16 rules)
  { name: "Auto Place SL And Target Price", description: "Automatically reapply previous day's stop-loss and target prices at market open", key: "foAutoPlaceSLAndTargetPrice", type: "boolean", marketType: "forex", tradingType: "option" },
  { name: "Auto Close Position On Market Reverse", description: "Automatically close position when market moves against your position by a set threshold", key: "foAutoClosePositionOnMarketReverse", type: "boolean", marketType: "forex", tradingType: "option" },
  { name: "Max Entries In Specific Symbol", description: "Maximum entries allowed per symbol", key: "foMaxEntriesInSpecificSymbol", type: "number", marketType: "forex", tradingType: "option" },
  { name: "Entry Side", description: "Choose which direction entries are allowed", key: "foEntrySide", type: "enum", options: ["Buy", "Sell", "Both"], marketType: "forex", tradingType: "option" },
  { name: "Max Pending Entry In Specific Symbol", description: "Maximum pending entries allowed per symbol", key: "foMaxPendingEntryInSpecificSymbol", type: "number", marketType: "forex", tradingType: "option" },
  { name: "Margin Types", description: "Select allowed margin type(s) for trading", key: "foMarginTypes", type: "enum", options: ["Isolated", "Cross"], marketType: "forex", tradingType: "option" },
  { name: "Max Entry Per Day", description: "Maximum number of trades allowed per day", key: "foMaxEntryPerDay", type: "number", marketType: "forex", tradingType: "option" },
  { name: "Entry Type", description: "Select allowed order types for entries", key: "foEntryType", type: "enum", options: ["Market", "Limit"], marketType: "forex", tradingType: "option" },
  { name: "Max Pending Order", description: "Maximum number of pending orders allowed", key: "foMaxPendingOrder", type: "number", marketType: "forex", tradingType: "option" },
  { name: "Consecutive Entry Duration", description: "Minimum waiting period required between trades to prevent overtrading", key: "foConsecutiveEntryDuration", type: "time", marketType: "forex", tradingType: "option" },
  { name: "Max Risk Entry", description: "Maximum risk allowed per trade (in %)", key: "foMaxRiskEntry", type: "number", marketType: "forex", tradingType: "option" },
  { name: "SL And TP Trailing Duration", description: "Disable SL & TP changes for this duration after any modification", key: "foSLAndTPTrailingDuration", type: "time", marketType: "forex", tradingType: "option" },
  { name: "Max Leverage", description: "Set the maximum leverage allowed", key: "foMaxLeverage", type: "number", marketType: "forex", tradingType: "option" },
  { name: "Position Min Hold Duration", description: "Minimum time to hold a position before it can be closed", key: "foPositionMinHoldDuration", type: "time", marketType: "forex", tradingType: "option" },
  { name: "Entry Block Period", description: "Block trade entries during this time range", key: "foEntryBlockPeriod", type: "timerange", marketType: "forex", tradingType: "option" },
  { name: "Pending Entry Block Period", description: "Block editing pending orders during this time range", key: "foPendingOrderModifyBlockPeriod", type: "timerange", marketType: "forex", tradingType: "option" },

  // Stock Market - Cash (16 rules)
  { name: "Auto Place SL And Target Price", description: "Automatically reapply previous day's stop-loss and target prices at market open", key: "scAutoPlaceSLAndTargetPrice", type: "boolean", marketType: "stockmarket", tradingType: "cash" },
  { name: "Auto Close Position On Market Reverse", description: "Automatically close position when market moves against your position by a set threshold", key: "scAutoClosePositionOnMarketReverse", type: "boolean", marketType: "stockmarket", tradingType: "cash" },
  { name: "Max Entries In Specific Symbol", description: "Maximum entries allowed per symbol", key: "scMaxEntriesInSpecificSymbol", type: "number", marketType: "stockmarket", tradingType: "cash" },
  { name: "Entry Side", description: "Choose which direction entries are allowed", key: "scEntrySide", type: "enum", options: ["Buy", "Sell"], marketType: "stockmarket", tradingType: "cash" },
  { name: "Max Pending Entry In Specific Symbol", description: "Maximum pending entries allowed per symbol", key: "scMaxPendingEntryInSpecificSymbol", type: "number", marketType: "stockmarket", tradingType: "cash" },
  { name: "Margin Types", description: "Select allowed margin type(s) for trading", key: "scMarginTypes", type: "enum", options: ["Isolated", "Cross", "None"], marketType: "stockmarket", tradingType: "cash" },
  { name: "Max Entry Per Day", description: "Maximum number of trades allowed per day", key: "scMaxEntryPerDay", type: "number", marketType: "stockmarket", tradingType: "cash" },
  { name: "Entry Type", description: "Select allowed order types for entries", key: "scEntryType", type: "enum", options: ["Market", "Limit", "Stop"], marketType: "stockmarket", tradingType: "cash" },
  { name: "Max Pending Order", description: "Maximum number of pending orders allowed", key: "scMaxPendingOrder", type: "number", marketType: "stockmarket", tradingType: "cash" },
  { name: "Consecutive Entry Duration", description: "Minimum waiting period required between trades to prevent overtrading", key: "scConsecutiveEntryDuration", type: "time", marketType: "stockmarket", tradingType: "cash" },
  { name: "Max Risk Entry", description: "Maximum risk allowed per trade (in %)", key: "scMaxRiskEntry", type: "number", marketType: "stockmarket", tradingType: "cash" },
  { name: "SL And TP Trailing Duration", description: "Disable SL & TP changes for this duration after any modification", key: "scSLAndTPTrailingDuration", type: "time", marketType: "stockmarket", tradingType: "cash" },
  { name: "Max Leverage", description: "Set the maximum leverage allowed", key: "scMaxLeverage", type: "number", marketType: "stockmarket", tradingType: "cash" },
  { name: "Position Min Hold Duration", description: "Minimum time to hold a position before it can be closed", key: "scPositionMinHoldDuration", type: "time", marketType: "stockmarket", tradingType: "cash" },
  { name: "Entry Block Period", description: "Block trade entries during this time range", key: "scEntryBlockPeriod", type: "timerange", marketType: "stockmarket", tradingType: "cash" },
  { name: "Pending Entry Block Period", description: "Block editing pending orders during this time range", key: "scPendingOrderModifyBlockPeriod", type: "timerange", marketType: "stockmarket", tradingType: "cash" },

  // Stock Market - Future (16 rules)
  { name: "Auto Place SL And Target Price", description: "Automatically reapply previous day's stop-loss and target prices at market open", key: "sfAutoPlaceSLAndTargetPrice", type: "boolean", marketType: "stockmarket", tradingType: "future" },
  { name: "Auto Close Position On Market Reverse", description: "Automatically close position when market moves against your position by a set threshold", key: "sfAutoClosePositionOnMarketReverse", type: "boolean", marketType: "stockmarket", tradingType: "future" },
  { name: "Max Entries In Specific Symbol", description: "Maximum entries allowed per symbol", key: "sfMaxEntriesInSpecificSymbol", type: "number", marketType: "stockmarket", tradingType: "future" },
  { name: "Entry Side", description: "Choose which direction entries are allowed", key: "sfEntrySide", type: "enum", options: ["Buy", "Sell"], marketType: "stockmarket", tradingType: "future" },
  { name: "Max Pending Entry In Specific Symbol", description: "Maximum pending entries allowed per symbol", key: "sfMaxPendingEntryInSpecificSymbol", type: "number", marketType: "stockmarket", tradingType: "future" },
  { name: "Margin Types", description: "Select allowed margin type(s) for trading", key: "sfMarginTypes", type: "enum", options: ["Isolated", "Cross"], marketType: "stockmarket", tradingType: "future" },
  { name: "Max Entry Per Day", description: "Maximum number of trades allowed per day", key: "sfMaxEntryPerDay", type: "number", marketType: "stockmarket", tradingType: "future" },
  { name: "Entry Type", description: "Select allowed order types for entries", key: "sfEntryType", type: "enum", options: ["Market", "Limit", "Stop"], marketType: "stockmarket", tradingType: "future" },
  { name: "Max Pending Order", description: "Maximum number of pending orders allowed", key: "sfMaxPendingOrder", type: "number", marketType: "stockmarket", tradingType: "future" },
  { name: "Consecutive Entry Duration", description: "Minimum waiting period required between trades to prevent overtrading", key: "sfConsecutiveEntryDuration", type: "time", marketType: "stockmarket", tradingType: "future" },
  { name: "Max Risk Entry", description: "Maximum risk allowed per trade (in %)", key: "sfMaxRiskEntry", type: "number", marketType: "stockmarket", tradingType: "future" },
  { name: "SL And TP Trailing Duration", description: "Disable SL & TP changes for this duration after any modification", key: "sfSLAndTPTrailingDuration", type: "time", marketType: "stockmarket", tradingType: "future" },
  { name: "Max Leverage", description: "Set the maximum leverage allowed", key: "sfMaxLeverage", type: "number", marketType: "stockmarket", tradingType: "future" },
  { name: "Position Min Hold Duration", description: "Minimum time to hold a position before it can be closed", key: "sfPositionMinHoldDuration", type: "time", marketType: "stockmarket", tradingType: "future" },
  { name: "Entry Block Period", description: "Block trade entries during this time range", key: "sfEntryBlockPeriod", type: "timerange", marketType: "stockmarket", tradingType: "future" },
  { name: "Pending Entry Block Period", description: "Block editing pending orders during this time range", key: "sfPendingOrderModifyBlockPeriod", type: "timerange", marketType: "stockmarket", tradingType: "future" },

  // Stock Market - Option (16 rules)
  { name: "Auto Place SL And Target Price", description: "Automatically reapply previous day's stop-loss and target prices at market open", key: "soAutoPlaceSLAndTargetPrice", type: "boolean", marketType: "stockmarket", tradingType: "option" },
  { name: "Auto Close Position On Market Reverse", description: "Automatically close position when market moves against your position by a set threshold", key: "soAutoClosePositionOnMarketReverse", type: "boolean", marketType: "stockmarket", tradingType: "option" },
  { name: "Max Entries In Specific Symbol", description: "Maximum entries allowed per symbol", key: "soMaxEntriesInSpecificSymbol", type: "number", marketType: "stockmarket", tradingType: "option" },
  { name: "Entry Side", description: "Choose which direction entries are allowed", key: "soEntrySide", type: "enum", options: ["Buy", "Sell"], marketType: "stockmarket", tradingType: "option" },
  { name: "Max Pending Entry In Specific Symbol", description: "Maximum pending entries allowed per symbol", key: "soMaxPendingEntryInSpecificSymbol", type: "number", marketType: "stockmarket", tradingType: "option" },
  { name: "Margin Types", description: "Select allowed margin type(s) for trading", key: "soMarginTypes", type: "enum", options: ["Isolated", "Cross"], marketType: "stockmarket", tradingType: "option" },
  { name: "Max Entry Per Day", description: "Maximum number of trades allowed per day", key: "soMaxEntryPerDay", type: "number", marketType: "stockmarket", tradingType: "option" },
  { name: "Entry Type", description: "Select allowed order types for entries", key: "soEntryType", type: "enum", options: ["Market", "Limit"], marketType: "stockmarket", tradingType: "option" },
  { name: "Max Pending Order", description: "Maximum number of pending orders allowed", key: "soMaxPendingOrder", type: "number", marketType: "stockmarket", tradingType: "option" },
  { name: "Consecutive Entry Duration", description: "Minimum waiting period required between trades to prevent overtrading", key: "soConsecutiveEntryDuration", type: "time", marketType: "stockmarket", tradingType: "option" },
  { name: "Max Risk Entry", description: "Maximum risk allowed per trade (in %)", key: "soMaxRiskEntry", type: "number", marketType: "stockmarket", tradingType: "option" },
  { name: "SL And TP Trailing Duration", description: "Disable SL & TP changes for this duration after any modification", key: "soSLAndTPTrailingDuration", type: "time", marketType: "stockmarket", tradingType: "option" },
  { name: "Max Leverage", description: "Set the maximum leverage allowed", key: "soMaxLeverage", type: "number", marketType: "stockmarket", tradingType: "option" },
  { name: "Position Min Hold Duration", description: "Minimum time to hold a position before it can be closed", key: "soPositionMinHoldDuration", type: "time", marketType: "stockmarket", tradingType: "option" },
  { name: "Entry Block Period", description: "Block trade entries during this time range", key: "soEntryBlockPeriod", type: "timerange", marketType: "stockmarket", tradingType: "option" },
  { name: "Pending Entry Block Period", description: "Block editing pending orders during this time range", key: "soPendingOrderModifyBlockPeriod", type: "timerange", marketType: "stockmarket", tradingType: "option" },
];

*/

/*
export interface Rule {
  name: string;
  description: string;
  key: string;
  type: 'boolean' | 'number' | 'time' | 'timerange' | 'enum';
  options?: string[];
}

export interface RuleValue {
  key: string;
  value: any;
  error?: string;
}

export interface TradingRules {
  cash: RuleValue[];
  future: RuleValue[];
  option: RuleValue[];
}

export const rules: Rule[] = [
  {
    name: "Auto Place SL And Target Price",
    description: "Automatically reapply previous day's stop-loss and target prices at market open",
    key: "autoPlaceSLAndTargetPrice",
    type: "boolean",
  },
  {
    name: "Auto Close Position On Market Reverse",
    description: "Automatically close position when market moves against your position by a set threshold",
    key: "autoClosePositionOnMarketReverse",
    type: "boolean",
  },
  {
    name: "Max Entries In Specific Symbol",
    description: "Maximum entries allowed per symbol",
    key: "maxEntriesInSpecificSymbol",
    type: "number",
  },
  {
    name: "Entry Side",
    description: "Choose which direction entries are allowed",
    key: "entrySide",
    type: "enum",
    options: ["Buy", "Sell", "Both"],
  },
  {
    name: "Max Pending Entry In Specific Symbol",
    description: "Maximum pending entries allowed per symbol",
    key: "maxPendingEntryInSpecificSymbol",
    type: "number",
  },
  {
    name: "Margin Types",
    description: "Select allowed margin type(s) for trading",
    key: "marginTypes",
    type: "enum",
    options: ["Isolated", "Cross", "None"],
  },
  {
    name: "Max Entry Per Day",
    description: "Maximum number of trades allowed per day",
    key: "maxEntryPerDay",
    type: "number",
  },
  {
    name: "Entry Type",
    description: "Select allowed order types for entries",
    key: "entryType",
    type: "enum",
    options: ["Market", "Limit", "Stop"],
  },
  {
    name: "Max Pending Order",
    description: "Maximum number of pending orders allowed",
    key: "maxPendingOrder",
    type: "number",
  },
  {
    name: "Consecutive Entry Duration",
    description: "Minimum waiting period required between trades to prevent overtrading",
    key: "consecutiveEntryDuration",
    type: "time",
  },
  {
    name: "Max Risk Entry",
    description: "Maximum risk allowed per trade (in %)",
    key: "maxRiskEntry",
    type: "number",
  },
  {
    name: "SL And TP Trailing Duration",
    description: "Disable SL & TP changes for this duration after any modification",
    key: "slAndTPTrailingDuration",
    type: "time",
  },
  {
    name: "Max Leverage",
    description: "Set the maximum leverage allowed",
    key: "maxLeverage",
    type: "number",
  },
  {
    name: "Position Min Hold Duration",
    description: "Minimum time to hold a position before it can be closed",
    key: "positionMinHoldDuration",
    type: "time",
  },
  {
    name: "Entry Block Period",
    description: "Block trade entries during this time range",
    key: "entryBlockPeriod",
    type: "timerange",
  },
  {
    name: "Pending Entry Block Period",
    description: "Block editing pending orders during this time range",
    key: "pendingOrderModifyBlockPeriod",
    type: "timerange",
  },
];
*/