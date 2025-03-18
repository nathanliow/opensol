import React from 'react';

export type WithClassnames<T = {}> = T & { className?: string };

export type WithChildren<T = {}> = T & { children?: React.ReactNode };
