package heritage.gen.modules.archive.repository;

import heritage.gen.modules.archive.model.ArcVideoEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ArcVideoRepository extends JpaRepository<ArcVideoEntity, Long> {

    @Query("SELECT v FROM ArcVideoEntity v WHERE v.userId = :userId AND (v.isDeleted = false OR v.isDeleted IS NULL) ORDER BY v.createdAt DESC")
    List<ArcVideoEntity> findByUserId(@Param("userId") Long userId);

    @Query("SELECT v FROM ArcVideoEntity v WHERE v.id = :id AND (v.isDeleted = false OR v.isDeleted IS NULL)")
    ArcVideoEntity findByIdActive(@Param("id") Long id);
}
