package com.clinic.repository;

import com.clinic.entity.TinNhanChat;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TinNhanChatRepository extends JpaRepository<TinNhanChat, Long> {
    List<TinNhanChat> findByMaPhongOrderByTaoLucDesc(Long maPhong, Pageable pageable);
}
