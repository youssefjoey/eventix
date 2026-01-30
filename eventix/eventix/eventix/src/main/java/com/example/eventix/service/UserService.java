package com.example.eventix.service;

import com.example.eventix.dto.UserDTO;
import com.example.eventix.dto.UserRegistrationDTO;
import com.example.eventix.exception.BadRequestException;
import com.example.eventix.exception.ResourceNotFoundException;
import com.example.eventix.model.Role;
import com.example.eventix.model.User;
import com.example.eventix.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;


    public UserDTO registerUser(UserRegistrationDTO registrationDTO) {
        if (userRepository.findByEmail(registrationDTO.getEmail()).isPresent()) {
            throw new BadRequestException("Email already registered: " + registrationDTO.getEmail());
        }

        User user = User.builder()
                .name(registrationDTO.getName())
                .email(registrationDTO.getEmail())
                .password(passwordEncoder.encode(registrationDTO.getPassword()))
                .role(Role.USER)
                .build();
        User savedUser = userRepository.save(user);

        return mapToDTO(savedUser);
    }

    public UserDTO getUserById(Long id){
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        return mapToDTO(user);
    }

    public List<UserDTO> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }


    public UserDTO findByEmail(String email){
        User user = userRepository.findByEmail(email)
                .orElseThrow(()-> new ResourceNotFoundException("User not found with email: " + email));
        return mapToDTO(user);
    }


    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    public UserDTO loginUser(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        System.out.println("🔑 Validating password for: " + email);
        System.out.println("   Stored password type: " + (user.getPassword() != null && user.getPassword().startsWith("$2a$") ? "BCRYPT" : "PLAIN TEXT"));

        // Handle both plain text passwords (legacy) and BCrypt hashed passwords (new)
        boolean passwordMatches = false;

        // Try BCrypt comparison first
        if (user.getPassword() != null && user.getPassword().startsWith("$2a$")) {
            // This is a hashed password
            System.out.println("🔑 Checking BCrypt password...");
            passwordMatches = passwordEncoder.matches(password, user.getPassword());
        } else {
            // Legacy plain text password - check directly and hash it for future use
            System.out.println("🔑 Checking plain text password (legacy)...");
            if (user.getPassword() != null && user.getPassword().equals(password)) {
                passwordMatches = true;
                System.out.println("✅ Plain text password matched! Auto-hashing for future use...");
                // Auto-upgrade: hash the plain text password
                user.setPassword(passwordEncoder.encode(password));
                userRepository.save(user);
                System.out.println("✅ Password upgraded to BCrypt");
            }
        }

        if (!passwordMatches) {
            System.out.println("❌ Password validation failed for: " + email);
            throw new BadRequestException("Invalid password");
        }

        System.out.println("✅ Password validation successful for: " + email);
        return mapToDTO(user);
    }

    private UserDTO mapToDTO(User user){
        return UserDTO.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().toString())
                .build();
    }

    public boolean isAdmin(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        return user.getRole() == Role.ADMIN;
    }
}



