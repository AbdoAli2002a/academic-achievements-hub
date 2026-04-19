
DROP POLICY IF EXISTS "System and admins insert notifications" ON public.notifications;

CREATE POLICY "Only admins insert notifications manually"
  ON public.notifications FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'super_admin'));
