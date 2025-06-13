import Hashids from 'hashids';

const configs = {
    GL: {
        salt: "dRgUkXp2s5v8y/B?E(H+MbQeShVmYq3t",
        minHashLength: 24,
    },
    alphabet: "abcdefghimnopqrstuvwxyzABCDEFGHIQRSTUVWXYZ1234567890",
    seps: "cfhistuCFHISTU"
};

// Create Hashids instance for GL
const glHashids = new Hashids(configs.GL.salt, configs.GL.minHashLength, configs.alphabet, configs.seps);

// Function to encode a search ID
export function encodeSearchId(id: number): string {
    return glHashids.encode(id);
}

// Function to decode a search ID
export function decodeSearchId(hash: string): number {
    const decoded = glHashids.decode(hash);
    return decoded[0] as number;
}

// Function to encode a property ID
export function encodePropertyId(id: number): string {
    return glHashids.encode(id);
}

// Function to decode a property ID
export function decodePropertyId(hash: string): number {
    const decoded = glHashids.decode(hash);
    return decoded[0] as number;
}

// Function to encode both IDs together
export function encodeIds(searchId: number, propertyId: number): string {
    return glHashids.encode(searchId, propertyId);
}

// Function to decode both IDs from a single hash
export function decodeIds(hash: string): { searchId: number; propertyId: number } {
    const decoded = glHashids.decode(hash);
    return {
        searchId: decoded[0] as number,
        propertyId: decoded[1] as number
    };
} 