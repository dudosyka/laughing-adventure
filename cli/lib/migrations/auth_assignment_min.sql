CREATE TABLE IF NOT EXISTS `mydb`.`auth_assgnment_min` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `rule_entity_id` INT NOT NULL,
  `rule_entity_id1` INT NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC) VISIBLE,
  INDEX `fk_auth_assgnment_min_rule_entity1_idx` (`rule_entity_id` ASC) VISIBLE,
  INDEX `fk_auth_assgnment_min_rule_entity2_idx` (`rule_entity_id1` ASC) VISIBLE,
  CONSTRAINT `fk_auth_assgnment_min_rule_entity1`
    FOREIGN KEY (`rule_entity_id`)
    REFERENCES `mydb`.`rule_entity` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_auth_assgnment_min_rule_entity2`
    FOREIGN KEY (`rule_entity_id1`)
    REFERENCES `mydb`.`rule_entity` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB