// Will clean this up later

Solana Program Structure:
Solana programs are typically structured as libraries, not as executable binaries. They are designed to run on the Solana blockchain, not as standalone applications. Therefore, they don't need a main() function, which is the entry point for executable programs.

Entry Point for Solana Programs:
Instead of a main() function, Solana programs use an entrypoint macro. This is defined in your lib.rs file with the line entrypoint!(process_instruction);. This tells the Solana runtime how to start executing your program.

Compilation Target:
Solana programs are compiled to BPF (Berkeley Packet Filter) bytecode, which is a special format that can run on the Solana blockchain. The presence of a main.rs file could confuse the build process, as it might try to create an executable binary instead of a library.

Avoiding Confusion:
Having both lib.rs and main.rs in a Solana project can lead to confusion about where the main logic of the program should reside. By convention and for clarity, all the code for a Solana program is typically kept in lib.rs.

# NEXT >> Go to the README.md in folder 'flexnet-gx-mobile folder'