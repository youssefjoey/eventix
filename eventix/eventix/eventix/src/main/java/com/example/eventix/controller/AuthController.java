package com.example.eventix.controller;

import com.example.eventix.dto.UserDTO;
import com.example.eventix.dto.UserRegistrationDTO;
import com.example.eventix.model.User;
import com.example.eventix.repository.UserRepository;
import com.example.eventix.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpSession;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserService userService;
    private final UserRepository userRepository;

    @PostMapping("/register")
    public ResponseEntity<UserDTO> register(@RequestBody UserRegistrationDTO registrationDTO) {
        UserDTO user = userService.registerUser(registrationDTO);
        return new ResponseEntity<>(user, HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<UserDTO> login(@RequestParam String email, @RequestParam String password, HttpSession session) {
        try {
            System.out.println("🔐 Login attempt for email: " + email);
            UserDTO user = userService.loginUser(email, password);
            System.out.println("✅ User authenticated: " + email + ", Role: " + user.getRole());

            
            Optional<User> userOptional = userRepository.findByEmail(email);
            if (userOptional.isPresent()) {
                User dbUser = userOptional.get();
                System.out.println("📝 User found in DB: " + dbUser.getName() + ", Role: " + dbUser.getRole());

                
                Collection<SimpleGrantedAuthority> authorities = new ArrayList<>();
                authorities.add(new SimpleGrantedAuthority("ROLE_" + dbUser.getRole().toString()));

                Authentication authentication = new UsernamePasswordAuthenticationToken(
                        email,
                        password,
                        authorities
                );

                
                SecurityContext securityContext = SecurityContextHolder.createEmptyContext();
                securityContext.setAuthentication(authentication);
                SecurityContextHolder.setContext(securityContext);

                
                session.setAttribute(
                        HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY,
                        securityContext
                );
                System.out.println("🔐 Session created with JSESSIONID: " + session.getId());
            }

            System.out.println("✅ Login successful for: " + email);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            System.out.println("❌ Login failed: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @GetMapping("/current")
    public ResponseEntity<UserDTO> getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated()) {
            UserDTO user = userService.findByEmail(auth.getName());
            return ResponseEntity.ok(user);
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }
}



