package com.example.eventix.service;

import com.example.eventix.dto.CategoryDTO;
import com.example.eventix.dto.UserDTO;
import com.example.eventix.exception.ResourceNotFoundException;
import com.example.eventix.model.Category;
import com.example.eventix.model.User;
import com.example.eventix.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public List<CategoryDTO> getAllCategories() {
        return categoryRepository.findAll()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }


    public CategoryDTO getCategoryById(Long id){
       Category category= categoryRepository.findById(id)
                .orElseThrow(()-> new ResourceNotFoundException("Category not found with id: " + id));

       return mapToDTO(category);
    }

    public CategoryDTO createCategory(CategoryDTO categoryDTO){
        Category category = Category.builder()
                .name(categoryDTO.getName())
                .description(categoryDTO.getDescription())
                .build();
        Category savedCategory = categoryRepository.save(category);

        return mapToDTO(savedCategory);
    }

    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id " + id));
        categoryRepository.delete(category);
    }

    private CategoryDTO mapToDTO(Category category){
        return CategoryDTO.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .build();
    }
}
