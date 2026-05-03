package com.clinic.repository;

import com.clinic.entity.TinNhanChat;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TinNhanChatRepository extends JpaRepository<TinNhanChat, Long> {
    List<TinNhanChat> findByMaPhongOrderByTaoLucDesc(Long maPhong, Pageable pageable);

    @Query("""
            SELECT t FROM TinNhanChat t WHERE t.nguoiNhan IS NOT NULL AND (
              (t.nguoiGui.id = :me AND t.nguoiNhan.id = :peer)
              OR (t.nguoiGui.id = :peer AND t.nguoiNhan.id = :me)
            ) ORDER BY t.taoLuc DESC
            """)
    List<TinNhanChat> timDoiThoai(@Param("me") Long me, @Param("peer") Long peer, Pageable pageable);
}
